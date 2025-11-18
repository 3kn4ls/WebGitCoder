import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { EditorComponent } from './components/editor/editor.component';
import { FileExplorerComponent } from './components/file-explorer/file-explorer.component';
import { GitPanelComponent } from './components/git-panel/git-panel.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

import { FileSystemService } from './services/file-system.service';
import { GitService } from './services/git.service';
import { EditorService } from './services/editor.service';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    EditorComponent,
    FileExplorerComponent,
    GitPanelComponent,
    ToolbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MonacoEditorModule.forRoot()
  ],
  providers: [
    FileSystemService,
    GitService,
    EditorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
