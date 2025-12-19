import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";

import { AppComponent } from "./app.component";
import { ToolbarComponent } from "./components/toolbar/toolbar.component";
import { SectionTreeComponent } from "./components/section-tree/section-tree.component";
import { SectionNodeComponent } from "./components/section-node/section-node.component";
import { ViewerCanvasComponent } from "./components/viewer-canvas/viewer-canvas.component";

import { reducers } from "./core/state";
import { ModelEffects } from "./core/state/model.effects";
import { ViewerEffects } from "./core/state/viewer.effects";
import { GlobalErrorHandler } from "./core/errors/global-error-handler";

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    SectionTreeComponent,
    SectionNodeComponent,
    ViewerCanvasComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([ModelEffects, ViewerEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
  ],
  providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
  bootstrap: [AppComponent],
})
export class AppModule {}
