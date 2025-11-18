import { Component, OnInit } from '@angular/core';
import { GitService, GitStatus, GitCommit } from '../../services/git.service';

@Component({
  selector: 'app-git-panel',
  templateUrl: './git-panel.component.html',
  styleUrls: ['./git-panel.component.css']
})
export class GitPanelComponent implements OnInit {
  status: GitStatus = {
    modified: [],
    added: [],
    deleted: [],
    untracked: []
  };

  commits: GitCommit[] = [];
  commitMessage = '';
  showCommitDialog = false;
  authorName = 'WebGitCoder User';
  authorEmail = 'user@webgitcoder.local';

  constructor(private gitService: GitService) {}

  ngOnInit() {
    this.gitService.status$.subscribe(status => {
      this.status = status;
    });

    this.gitService.commits$.subscribe(commits => {
      this.commits = commits;
    });

    this.loadData();
  }

  async loadData() {
    try {
      await this.gitService.refreshStatus();
      await this.gitService.loadCommits();
    } catch (error) {
      console.error('Error loading git data:', error);
    }
  }

  async stageFile(file: string) {
    try {
      await this.gitService.add(file);
    } catch (error) {
      alert('Error al agregar archivo: ' + error);
    }
  }

  async stageAll() {
    try {
      await this.gitService.addAll();
    } catch (error) {
      alert('Error al agregar todos los archivos: ' + error);
    }
  }

  openCommitDialog() {
    this.showCommitDialog = true;
    this.commitMessage = '';
  }

  closeCommitDialog() {
    this.showCommitDialog = false;
    this.commitMessage = '';
  }

  async commit() {
    if (!this.commitMessage.trim()) {
      alert('Por favor ingresa un mensaje de commit');
      return;
    }

    try {
      await this.gitService.commit(this.commitMessage, {
        name: this.authorName,
        email: this.authorEmail
      });
      this.closeCommitDialog();
    } catch (error) {
      alert('Error al hacer commit: ' + error);
    }
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'modified': '📝',
      'added': '➕',
      'deleted': '❌',
      'untracked': '❔'
    };
    return icons[status] || '📄';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'modified': 'Modificados',
      'added': 'Agregados',
      'deleted': 'Eliminados',
      'untracked': 'Sin seguimiento'
    };
    return labels[status] || status;
  }

  getTotalChanges(): number {
    return this.status.modified.length +
           this.status.added.length +
           this.status.deleted.length +
           this.status.untracked.length;
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      }
      return `hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (days === 1) {
      return 'ayer';
    } else if (days < 7) {
      return `hace ${days} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  async initRepository() {
    try {
      await this.gitService.init();
      alert('Repositorio Git inicializado');
    } catch (error) {
      alert('Error al inicializar repositorio: ' + error);
    }
  }
}
