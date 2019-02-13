import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import {SuiModule} from 'ng2-semantic-ui';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    SuiModule,
    MonacoEditorModule.forRoot(),
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
