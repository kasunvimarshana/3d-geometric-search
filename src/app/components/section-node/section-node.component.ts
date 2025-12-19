import { Component, Input } from "@angular/core";
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
export class SectionNodeComponent {
  @Input() node!: SectionNode;
  expanded = true;
  selectedId$: Observable<string | null>;

  constructor(private store: Store) {
    this.selectedId$ = this.store.select(ModelSelectors.selectFocusedNodeId);
  }

  toggle() {
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
}
