import { Component, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { SectionNode } from "../../core/state/model.types";
import * as ModelActions from "../../core/state/model.actions";
import * as ViewerActions from "../../core/state/viewer.actions";

@Component({
  selector: "li[app-section-node]",
  templateUrl: "./section-node.component.html",
})
export class SectionNodeComponent {
  @Input() node!: SectionNode;
  expanded = true;

  constructor(private store: Store) {}

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
}
