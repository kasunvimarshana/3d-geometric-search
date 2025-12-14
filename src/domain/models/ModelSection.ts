/**
 * Model Section
 * 
 * Represents a section (component/part) within a 3D model.
 * Contains hierarchy information and geometric properties.
 */

export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

export interface ModelSection {
  readonly id: string;
  readonly name: string;
  readonly parentId: string | null;
  readonly children: string[];
  boundingBox: BoundingBox | null;
  readonly metadata: Record<string, unknown>;
  isVisible: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
}

export class ModelSectionImpl implements ModelSection {
  public isVisible = true;
  public isHighlighted = false;
  public isSelected = false;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly parentId: string | null = null,
    public readonly children: string[] = [],
    public boundingBox: BoundingBox | null = null,
    public readonly metadata: Record<string, unknown> = {}
  ) {}

  clone(): ModelSectionImpl {
    const section = new ModelSectionImpl(
      this.id,
      this.name,
      this.parentId,
      [...this.children],
      this.boundingBox,
      { ...this.metadata }
    );
    section.isVisible = this.isVisible;
    section.isHighlighted = this.isHighlighted;
    section.isSelected = this.isSelected;
    return section;
  }
}
