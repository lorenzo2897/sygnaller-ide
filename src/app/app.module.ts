import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import {SuiModule} from 'ng2-semantic-ui';
import { AceEditorModule } from 'ng2-ace-editor';

import { AppComponent } from './app.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RecentProjectsComponent } from './components/recent-projects/recent-projects.component';
import { GettingStartedPageComponent } from './components/getting-started-page/getting-started-page.component';
import { NewProjectModalComponent } from './modals/new-project-modal/new-project-modal.component';
import { RenameFileModalComponent } from './modals/rename-file-modal/rename-file-modal.component';
import { DeleteFileModalComponent } from './modals/delete-file-modal/delete-file-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    SidebarComponent,
    RecentProjectsComponent,
    GettingStartedPageComponent,
    NewProjectModalComponent,
    RenameFileModalComponent,
    DeleteFileModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxElectronModule,
    SuiModule,
    AceEditorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
