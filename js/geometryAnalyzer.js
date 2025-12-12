/**
 * Geometry Analyzer - Extracts shape features from 3D models
 */

import * as THREE from 'three';

export class GeometryAnalyzer {
    constructor() {
        this.features = {};
    }

    /**
     * Analyze a Three.js geometry and extract features
     */
    analyzeGeometry(geometry, name) {
        if (!geometry) return null;

        // Ensure geometry has proper attributes
        if (geometry.isBufferGeometry) {
            if (!geometry.attributes.position) {
                console.warn('Geometry has no position attribute');
                return null;
            }
        }

        // Compute bounding box if not already computed
        if (!geometry.boundingBox) {
            geometry.computeBoundingBox();
        }
        if (!geometry.boundingSphere) {
            geometry.computeBoundingSphere();
        }

        const features = {
            name: name || 'Model',
            vertexCount: this.getVertexCount(geometry),
            faceCount: this.getFaceCount(geometry),
            boundingBox: this.getBoundingBoxDimensions(geometry),
            volume: this.approximateVolume(geometry),
            surfaceArea: this.approximateSurfaceArea(geometry),
            compactness: 0,
            aspectRatio: this.calculateAspectRatio(geometry),
            centerOfMass: this.calculateCenterOfMass(geometry)
        };

        // Calculate compactness (sphere-likeness)
        if (features.volume > 0 && features.surfaceArea > 0) {
            features.compactness = Math.pow(features.volume, 2/3) / features.surfaceArea;
        }

        this.features[name] = features;
        return features;
    }

    getVertexCount(geometry) {
        if (geometry.isBufferGeometry) {
            return geometry.attributes.position ? geometry.attributes.position.count : 0;
        }
        return geometry.vertices ? geometry.vertices.length : 0;
    }

    getFaceCount(geometry) {
        if (geometry.isBufferGeometry) {
            const positions = geometry.attributes.position;
            return positions ? positions.count / 3 : 0;
        }
        return geometry.faces ? geometry.faces.length : 0;
    }

    getBoundingBoxDimensions(geometry) {
        const bbox = geometry.boundingBox;
        if (!bbox) return { x: 0, y: 0, z: 0 };

        return {
            x: Math.abs(bbox.max.x - bbox.min.x),
            y: Math.abs(bbox.max.y - bbox.min.y),
            z: Math.abs(bbox.max.z - bbox.min.z)
        };
    }

    approximateVolume(geometry) {
        const bbox = this.getBoundingBoxDimensions(geometry);
        // Simple approximation using bounding box
        return bbox.x * bbox.y * bbox.z;
    }

    approximateSurfaceArea(geometry) {
        if (!geometry.isBufferGeometry || !geometry.attributes.position) {
            return 0;
        }

        const positions = geometry.attributes.position.array;
        let area = 0;

        // Calculate surface area from triangles
        for (let i = 0; i < positions.length; i += 9) {
            const v1 = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
            const v2 = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);
            const v3 = new THREE.Vector3(positions[i+6], positions[i+7], positions[i+8]);

            // Calculate triangle area using cross product
            const side1 = new THREE.Vector3().subVectors(v2, v1);
            const side2 = new THREE.Vector3().subVectors(v3, v1);
            const cross = new THREE.Vector3().crossVectors(side1, side2);
            area += cross.length() / 2;
        }

        return area;
    }

    calculateAspectRatio(geometry) {
        const bbox = this.getBoundingBoxDimensions(geometry);
        const dimensions = [bbox.x, bbox.y, bbox.z].sort((a, b) => b - a);
        
        // Handle degenerate geometry (flat or line-like shapes)
        if (dimensions[2] === 0) {
            if (dimensions[0] === 0) {
                return 1; // Point geometry
            }
            return Infinity; // Flat or line geometry
        }
        
        return dimensions[0] / dimensions[2]; // max / min
    }

    calculateCenterOfMass(geometry) {
        if (!geometry.isBufferGeometry || !geometry.attributes.position) {
            return new THREE.Vector3(0, 0, 0);
        }

        const positions = geometry.attributes.position.array;
        const center = new THREE.Vector3(0, 0, 0);
        const count = positions.length / 3;

        for (let i = 0; i < positions.length; i += 3) {
            center.x += positions[i];
            center.y += positions[i + 1];
            center.z += positions[i + 2];
        }

        center.divideScalar(count);
        return center;
    }

    /**
     * Calculate similarity between two models
     * Returns a score between 0 (completely different) and 100 (identical)
     */
    calculateSimilarity(features1, features2) {
        if (!features1 || !features2) return 0;

        const weights = {
            vertexCount: 0.15,
            faceCount: 0.15,
            volume: 0.20,
            surfaceArea: 0.15,
            compactness: 0.15,
            aspectRatio: 0.20
        };

        let totalScore = 0;

        // Compare vertex count (normalized)
        const vertexDiff = Math.abs(features1.vertexCount - features2.vertexCount);
        const maxVertices = Math.max(features1.vertexCount, features2.vertexCount);
        const vertexSimilarity = maxVertices > 0 ? 1 - (vertexDiff / maxVertices) : 1;
        totalScore += vertexSimilarity * weights.vertexCount;

        // Compare face count
        const faceDiff = Math.abs(features1.faceCount - features2.faceCount);
        const maxFaces = Math.max(features1.faceCount, features2.faceCount);
        const faceSimilarity = maxFaces > 0 ? 1 - (faceDiff / maxFaces) : 1;
        totalScore += faceSimilarity * weights.faceCount;

        // Compare volume
        const volumeDiff = Math.abs(features1.volume - features2.volume);
        const maxVolume = Math.max(features1.volume, features2.volume);
        const volumeSimilarity = maxVolume > 0 ? 1 - (volumeDiff / maxVolume) : 1;
        totalScore += volumeSimilarity * weights.volume;

        // Compare surface area
        const areaDiff = Math.abs(features1.surfaceArea - features2.surfaceArea);
        const maxArea = Math.max(features1.surfaceArea, features2.surfaceArea);
        const areaSimilarity = maxArea > 0 ? 1 - (areaDiff / maxArea) : 1;
        totalScore += areaSimilarity * weights.surfaceArea;

        // Compare compactness
        const compactnessDiff = Math.abs(features1.compactness - features2.compactness);
        const maxCompactness = Math.max(features1.compactness, features2.compactness);
        const compactnessSimilarity = maxCompactness > 0 ? 1 - (compactnessDiff / maxCompactness) : 1;
        totalScore += compactnessSimilarity * weights.compactness;

        // Compare aspect ratio
        const ratioDiff = Math.abs(features1.aspectRatio - features2.aspectRatio);
        const maxRatio = Math.max(features1.aspectRatio, features2.aspectRatio);
        const ratioSimilarity = maxRatio > 0 ? 1 - (ratioDiff / maxRatio) : 1;
        totalScore += ratioSimilarity * weights.aspectRatio;

        return Math.round(totalScore * 100);
    }

    /**
     * Find similar models from a library
     */
    findSimilar(targetFeatures, libraryFeatures, limit = 5) {
        const similarities = [];

        for (const [name, features] of Object.entries(libraryFeatures)) {
            if (name === targetFeatures.name) continue; // Skip self

            const similarity = this.calculateSimilarity(targetFeatures, features);
            similarities.push({
                name: name,
                similarity: similarity,
                features: features
            });
        }

        // Sort by similarity (descending) and return top matches
        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.slice(0, limit);
    }
}
