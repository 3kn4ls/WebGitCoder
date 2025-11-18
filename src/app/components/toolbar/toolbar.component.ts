import { Component } from '@angular/core';
import { GitService } from '../../services/git.service';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  showCloneDialog = false;
  showCredentialsDialog = false;

  cloneUrl = '';
  username = '';
  password = '';
  currentAction: 'push' | 'pull' | 'clone' = 'clone';
  currentBranch = 'main';

  constructor(
    private gitService: GitService,
    private editorService: EditorService
  ) {
    this.loadCurrentBranch();
  }

  async loadCurrentBranch() {
    try {
      this.currentBranch = await this.gitService.getCurrentBranch();
    } catch (error) {
      console.error('Error loading current branch:', error);
    }
  }

  openCloneDialog() {
    this.showCloneDialog = true;
  }

  closeCloneDialog() {
    this.showCloneDialog = false;
    this.cloneUrl = '';
  }

  async cloneRepository() {
    if (!this.cloneUrl) return;

    try {
      await this.gitService.clone(this.cloneUrl, this.username, this.password);
      this.closeCloneDialog();
      await this.loadCurrentBranch();
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        this.currentAction = 'clone';
        this.showCredentialsDialog = true;
      } else {
        alert('Error al clonar repositorio: ' + error.message);
      }
    }
  }

  async pull() {
    try {
      await this.gitService.pull(this.username, this.password);
      alert('Pull completado exitosamente');
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        this.currentAction = 'pull';
        this.showCredentialsDialog = true;
      } else {
        alert('Error al hacer pull: ' + error.message);
      }
    }
  }

  async push() {
    try {
      await this.gitService.push(this.username, this.password);
      alert('Push completado exitosamente');
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        this.currentAction = 'push';
        this.showCredentialsDialog = true;
      } else {
        alert('Error al hacer push: ' + error.message);
      }
    }
  }

  async saveAll() {
    try {
      await this.editorService.saveAll();
    } catch (error) {
      alert('Error al guardar archivos');
    }
  }

  async submitCredentials() {
    this.showCredentialsDialog = false;

    if (this.currentAction === 'clone') {
      await this.cloneRepository();
    } else if (this.currentAction === 'push') {
      await this.push();
    } else if (this.currentAction === 'pull') {
      await this.pull();
    }
  }

  closeCredentialsDialog() {
    this.showCredentialsDialog = false;
    this.username = '';
    this.password = '';
  }
}
