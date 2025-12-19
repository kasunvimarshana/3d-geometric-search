import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Store } from "@ngrx/store";
import { SectionNode } from "../../core/state/model.types";
import * as ModelActions from "../../core/state/model.actions";
import * as ModelSelectors from "../../core/state/model.selectors";
import * as ViewerActions from "../../core/state/viewer.actions";
import { Observable } from "rxjs";

@Component({
  selector: "li[app-section-node]",
  templateUrl: "./section-node.component.html",
  styleUrls: ["./section-node.component.scss"],
})
export class SectionNodeComponent implements OnChanges {
  @Input() node!: SectionNode;
  @Input() expandedPath: string[] = [];
  expanded = true;
  selectedId$: Observable<string | null>;
  private userToggled = false;

  constructor(private store: Store) {
    this.selectedId$ = this.store.select(ModelSelectors.selectFocusedNodeId);
  }

  toggle() {
    this.userToggled = true;
    this.expanded = !this.expanded;
  }

  select() {
    this.store.dispatch(ModelActions.focusNode({ nodeId: this.node.id }));
  }

  highlight() {
    this.store.dispatch(ViewerActions.highlightById({ id: this.node.id }));
  }

  isolate() {
    this.store.dispatch(ViewerActions.isolateById({ id: this.node.id }));
  }

  fit() {
    this.store.dispatch(ViewerActions.fitToObject({ id: this.node.id }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["expandedPath"] && !this.userToggled) {
      this.expanded = this.expandedPath?.includes(this.node.id);
    }
  }
}
