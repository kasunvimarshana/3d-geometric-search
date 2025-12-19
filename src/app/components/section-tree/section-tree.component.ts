import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { SectionNode } from "../../core/state/model.types";
import * as ModelSelectors from "../../core/state/model.selectors";
import * as ModelActions from "../../core/state/model.actions";

@Component({
  selector: "app-section-tree",
  templateUrl: "./section-tree.component.html",
})
export class SectionTreeComponent {
  tree$: Observable<SectionNode[]>;
  selectedId$: Observable<string | null>;

  constructor(private store: Store) {
    this.tree$ = this.store.select(ModelSelectors.selectSectionTree);
    this.selectedId$ = this.store.select(ModelSelectors.selectFocusedNodeId);
  }

  selectNode(node: SectionNode) {
    this.store.dispatch(ModelActions.focusNode({ nodeId: node.id }));
  }
}
