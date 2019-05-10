import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import {SuiModule} from 'ng2-semantic-ui';
import { AceEditorModule } from 'ng2-ace-editor';

import { AppComponent } from './app.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RecentProjectsComponent } from './components/recent-projects/recent-projects.component';
import { GettingStartedPageComponent } from './components/getting-started-page/getting-started-page.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { NewProjectModalComponent } from './modals/new-project-modal/new-project-modal.component';
import { RenameFileModalComponent } from './modals/rename-file-modal/rename-file-modal.component';
import { DeleteFileModalComponent } from './modals/delete-file-modal/delete-file-modal.component';
import { NewConnectionModalComponent } from './modals/new-connection-modal/new-connection-modal.component';
import { FormatMacPipe } from './pipes/format-mac.pipe';
import { ComponentEditorComponent } from './components/component-editor/component-editor.component';
import { ComponentBlockComponent } from './components/component-block/component-block.component';
import { BuildInfoComponent } from './components/build-info/build-info.component';

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    SidebarComponent,
    RecentProjectsComponent,
    GettingStartedPageComponent,
    NewProjectModalComponent,
    RenameFileModalComponent,
    DeleteFileModalComponent,
    NewConnectionModalComponent,
    TerminalComponent,
    FormatMacPipe,
    ComponentEditorComponent,
    ComponentBlockComponent,
    BuildInfoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgxElectronModule,
    SuiModule,
    AceEditorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
