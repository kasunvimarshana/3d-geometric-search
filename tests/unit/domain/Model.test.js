/**
 * Unit Tests for Model Domain Entity
 *
 * @group unit
 * @group domain
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '@domain/models/Model.js';
import { BoundingBox } from '@domain/values/BoundingBox.js';
import { Vector3D } from '@domain/values/Vector3D.js';

describe('Model', () => {
  let validModelParams;

  beforeEach(() => {
    validModelParams = {
      id: 'test-model-1',
      name: 'Test Model',
      format: 'gltf',
      source: 'https://example.com/model.gltf',
      metadata: { author: 'Test Author', version: '1.0' },
    };
  });

  describe('Constructor', () => {
    it('should create a valid model with required fields', () => {
      const model = new Model(validModelParams);

      expect(model.id).toBe('test-model-1');
      expect(model.name).toBe('Test Model');
      expect(model.format).toBe('gltf');
      expect(model.source).toBe('https://example.com/model.gltf');
      expect(model.metadata).toEqual({ author: 'Test Author', version: '1.0' });
    });

    it('should normalize format to lowercase', () => {
      const model = new Model({ ...validModelParams, format: 'GLTF' });
      expect(model.format).toBe('gltf');
    });

    it('should throw error if id is missing', () => {
      const params = { ...validModelParams };
      delete params.id;
      expect(() => new Model(params)).toThrow('Model id is required');
    });

    it('should throw error if name is missing', () => {
      const params = { ...validModelParams };
      delete params.name;
      expect(() => new Model(params)).toThrow('Model name is required');
    });

    it('should throw error if format is missing', () => {
      const params = { ...validModelParams };
      delete params.format;
      expect(() => new Model(params)).toThrow('Model format is required');
    });

    it('should throw error if source is missing', () => {
      const params = { ...validModelParams };
      delete params.source;
      expect(() => new Model(params)).toThrow('Model source is required');
    });

    it('should set default values for optional fields', () => {
      const model = new Model(validModelParams);

      expect(model.metadata).toEqual({ author: 'Test Author', version: '1.0' });
      expect(model.sections).toEqual([]);
      expect(model.assembly).toBeNull();
      expect(model.boundingBox).toBeNull();
      expect(model.loadedAt).toBeInstanceOf(Date);
    });

    it('should accept custom loadedAt date', () => {
      const customDate = new Date('2023-01-01');
      const model = new Model({ ...validModelParams, loadedAt: customDate });

      expect(model.loadedAt).toBe(customDate);
    });

    it('should freeze the instance (immutable)', () => {
      const model = new Model(validModelParams);

      expect(Object.isFrozen(model)).toBe(true);
      expect(() => {
        model.name = 'New Name';
      }).toThrow();
    });

    it('should freeze nested metadata object', () => {
      const model = new Model(validModelParams);

      expect(Object.isFrozen(model.metadata)).toBe(true);
      expect(() => {
        model.metadata.author = 'New Author';
      }).toThrow();
    });

    it('should freeze sections array', () => {
      const model = new Model(validModelParams);

      expect(Object.isFrozen(model.sections)).toBe(true);
      expect(() => {
        model.sections.push({});
      }).toThrow();
    });
  });

  describe('isFile()', () => {
    it('should return true when source is a File object', () => {
      const file = new File(['content'], 'test.gltf', { type: 'model/gltf+json' });
      const model = new Model({ ...validModelParams, source: file });

      expect(model.isFile()).toBe(true);
    });

    it('should return false when source is a URL string', () => {
      const model = new Model(validModelParams);

      expect(model.isFile()).toBe(false);
    });
  });

  describe('isURL()', () => {
    it('should return true when source is a string', () => {
      const model = new Model(validModelParams);

      expect(model.isURL()).toBe(true);
    });

    it('should return false when source is a File object', () => {
      const file = new File(['content'], 'test.gltf', { type: 'model/gltf+json' });
      const model = new Model({ ...validModelParams, source: file });

      expect(model.isURL()).toBe(false);
    });
  });

  describe('getExtension()', () => {
    it('should return file extension for URL source', () => {
      const model = new Model({
        ...validModelParams,
        source: 'https://example.com/model.gltf',
      });

      expect(model.getExtension()).toBe('.gltf');
    });

    it('should return file extension for File source', () => {
      const file = new File(['content'], 'test.glb', { type: 'model/gltf-binary' });
      const model = new Model({ ...validModelParams, source: file });

      expect(model.getExtension()).toBe('.glb');
    });

    it('should return empty string for URL without extension', () => {
      const model = new Model({
        ...validModelParams,
        source: 'https://example.com/model',
      });

      expect(model.getExtension()).toBe('');
    });
  });

  describe('getSections()', () => {
    it('should return all sections', () => {
      const sections = [
        { id: 'section-1', name: 'Section 1' },
        { id: 'section-2', name: 'Section 2' },
      ];
      const model = new Model({ ...validModelParams, sections });

      expect(model.getSections()).toEqual(sections);
    });

    it('should return empty array when no sections', () => {
      const model = new Model(validModelParams);

      expect(model.getSections()).toEqual([]);
    });
  });

  describe('getSectionCount()', () => {
    it('should return correct section count', () => {
      const sections = [
        { id: 'section-1', name: 'Section 1' },
        { id: 'section-2', name: 'Section 2' },
        { id: 'section-3', name: 'Section 3' },
      ];
      const model = new Model({ ...validModelParams, sections });

      expect(model.getSectionCount()).toBe(3);
    });

    it('should return 0 when no sections', () => {
      const model = new Model(validModelParams);

      expect(model.getSectionCount()).toBe(0);
    });
  });

  describe('hasSections()', () => {
    it('should return true when model has sections', () => {
      const sections = [{ id: 'section-1', name: 'Section 1' }];
      const model = new Model({ ...validModelParams, sections });

      expect(model.hasSections()).toBe(true);
    });

    it('should return false when model has no sections', () => {
      const model = new Model(validModelParams);

      expect(model.hasSections()).toBe(false);
    });
  });

  describe('hasAssembly()', () => {
    it('should return true when model has assembly', () => {
      const assembly = { id: 'assembly-1', name: 'Main Assembly' };
      const model = new Model({ ...validModelParams, assembly });

      expect(model.hasAssembly()).toBe(true);
    });

    it('should return false when model has no assembly', () => {
      const model = new Model(validModelParams);

      expect(model.hasAssembly()).toBe(false);
    });
  });

  describe('getVolume()', () => {
    it('should return volume from bounding box', () => {
      const boundingBox = new BoundingBox(new Vector3D(0, 0, 0), new Vector3D(10, 10, 10));
      const model = new Model({ ...validModelParams, boundingBox });

      expect(model.getVolume()).toBe(1000);
    });

    it('should return 0 when no bounding box', () => {
      const model = new Model(validModelParams);

      expect(model.getVolume()).toBe(0);
    });
  });

  describe('toJSON()', () => {
    it('should serialize model to JSON', () => {
      const model = new Model(validModelParams);
      const json = model.toJSON();

      expect(json).toEqual({
        id: 'test-model-1',
        name: 'Test Model',
        format: 'gltf',
        source: 'https://example.com/model.gltf',
        metadata: { author: 'Test Author', version: '1.0' },
        sections: [],
        assembly: null,
        boundingBox: null,
        loadedAt: model.loadedAt.toISOString(),
      });
    });

    it('should handle File source in JSON', () => {
      const file = new File(['content'], 'test.gltf', { type: 'model/gltf+json' });
      const model = new Model({ ...validModelParams, source: file });
      const json = model.toJSON();

      expect(json.source).toEqual({
        name: 'test.gltf',
        type: 'model/gltf+json',
        size: 7,
      });
    });
  });

  describe('equals()', () => {
    it('should return true for models with same id', () => {
      const model1 = new Model(validModelParams);
      const model2 = new Model(validModelParams);

      expect(model1.equals(model2)).toBe(true);
    });

    it('should return false for models with different ids', () => {
      const model1 = new Model(validModelParams);
      const model2 = new Model({ ...validModelParams, id: 'different-id' });

      expect(model1.equals(model2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const model = new Model(validModelParams);

      expect(model.equals(null)).toBe(false);
    });

    it('should return false when comparing with non-Model object', () => {
      const model = new Model(validModelParams);

      expect(model.equals({ id: 'test-model-1' })).toBe(false);
    });
  });

  describe('clone()', () => {
    it('should create a new instance with same properties', () => {
      const model = new Model(validModelParams);
      const cloned = model.clone();

      expect(cloned).not.toBe(model);
      expect(cloned.id).toBe(model.id);
      expect(cloned.name).toBe(model.name);
      expect(cloned.format).toBe(model.format);
      expect(cloned.source).toBe(model.source);
    });

    it('should allow overriding properties in clone', () => {
      const model = new Model(validModelParams);
      const cloned = model.clone({ name: 'Cloned Model', format: 'glb' });

      expect(cloned.id).toBe(model.id);
      expect(cloned.name).toBe('Cloned Model');
      expect(cloned.format).toBe('glb');
    });

    it('should maintain immutability of cloned instance', () => {
      const model = new Model(validModelParams);
      const cloned = model.clone();

      expect(Object.isFrozen(cloned)).toBe(true);
    });
  });
});
