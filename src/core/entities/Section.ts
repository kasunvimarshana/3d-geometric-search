import { UUID, Transform, SectionNode } from "@shared/types/interfaces";
import { generateId } from "@shared/utils/helpers";

/**
 * Section entity representing a node in the model hierarchy
 * Follows Single Responsibility Principle - manages section data and relationships
 */
export class Section {
  private readonly _id: UUID;
  private _name: string;
  private _parentId?: UUID;
  private _children: Set<UUID>;
  private _geometryIds: Set<UUID>;
  private _transform?: Transform;
  private _visible: boolean;
  private _selectable: boolean;
  private _properties: Map<string, unknown>;
  private _metadata?: SectionNode["metadata"];

  constructor(data: Partial<SectionNode> & { name: string }) {
    this._id = data.id || generateId();
    this._name = data.name;
    this._parentId = data.parentId;
    this._children = new Set(data.children || []);
    this._geometryIds = new Set(data.geometryIds || []);
    this._transform = data.transform;
    this._visible = data.visible !== undefined ? data.visible : true;
    this._selectable = data.selectable !== undefined ? data.selectable : true;
    this._properties = new Map(Object.entries(data.properties || {}));
    this._metadata = data.metadata;
  }

  // Getters
  get id(): UUID {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get parentId(): UUID | undefined {
    return this._parentId;
  }

  get children(): UUID[] {
    return Array.from(this._children);
  }

  get geometryIds(): UUID[] {
    return Array.from(this._geometryIds);
  }

  get transform(): Transform | undefined {
    return this._transform;
  }

  get visible(): boolean {
    return this._visible;
  }

  get selectable(): boolean {
    return this._selectable;
  }

  get metadata(): SectionNode["metadata"] | undefined {
    return this._metadata;
  }

  // Methods for managing relationships
  addChild(childId: UUID): void {
    this._children.add(childId);
  }

  removeChild(childId: UUID): void {
    this._children.delete(childId);
  }

  hasChild(childId: UUID): boolean {
    return this._children.has(childId);
  }

  addGeometry(geometryId: UUID): void {
    this._geometryIds.add(geometryId);
  }

  removeGeometry(geometryId: UUID): void {
    this._geometryIds.delete(geometryId);
  }

  // State management
  setVisible(visible: boolean): void {
    this._visible = visible;
  }

  setSelectable(selectable: boolean): void {
    this._selectable = selectable;
  }

  setTransform(transform: Transform): void {
    this._transform = transform;
  }

  setProperty(key: string, value: unknown): void {
    this._properties.set(key, value);
  }

  getProperty(key: string): unknown {
    return this._properties.get(key);
  }

  // Serialization
  toJSON(): SectionNode {
    return {
      id: this._id,
      name: this._name,
      parentId: this._parentId,
      children: this.children,
      geometryIds: this.geometryIds,
      transform: this._transform,
      visible: this._visible,
      selectable: this._selectable,
      properties: Object.fromEntries(this._properties),
      metadata: this._metadata,
    };
  }
}
