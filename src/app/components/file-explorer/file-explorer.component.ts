import { Component, OnInit } from '@angular/core';
import { FileSystemService } from '../../services/file-system.service';
import { EditorService } from '../../services/editor.service';
import { FileNode } from '../../models/file-node.model';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent implements OnInit {
  fileTree: FileNode[] = [];
  showNewFileDialog = false;
  showNewFolderDialog = false;
  newItemName = '';
  contextMenuFile: FileNode | null = null;
  selectedNode: FileNode | null = null;

  constructor(
    private fileSystemService: FileSystemService,
    private editorService: EditorService
  ) {}

  ngOnInit() {
    this.fileSystemService.fileTree$.subscribe(tree => {
      this.fileTree = tree;
    });
  }

  toggleNode(node: FileNode) {
    if (node.type === 'directory') {
      node.isExpanded = !node.isExpanded;
    }
  }

  async onNodeClick(node: FileNode) {
    this.selectedNode = node;

    if (node.type === 'file') {
      try {
        await this.editorService.openFile(node.path);
      } catch (error) {
        alert('Error al abrir archivo: ' + error);
      }
    } else {
      this.toggleNode(node);
    }
  }

  getNodeIcon(node: FileNode): string {
    if (node.type === 'directory') {
      return node.isExpanded ? '📂' : '📁';
    }

    const extension = node.name.split('.').pop()?.toLowerCase() || '';
    const iconMap: { [key: string]: string } = {
      'ts': '🔷',
      'js': '🟨',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
      'txt': '📄',
      'py': '🐍',
      'java': '☕',
      'xml': '📰',
      'yml': '⚙️',
      'yaml': '⚙️'
    };

    return iconMap[extension] || '📄';
  }

  getNodeIndent(level: number): number {
    return level * 16;
  }

  openNewFileDialog() {
    this.showNewFileDialog = true;
    this.newItemName = '';
  }

  openNewFolderDialog() {
    this.showNewFolderDialog = true;
    this.newItemName = '';
  }

  async createNewFile() {
    if (!this.newItemName) return;

    try {
      const basePath = this.fileSystemService.getCurrentWorkingDirectory();
      const filePath = `${basePath}/${this.newItemName}`;
      await this.fileSystemService.createFile(filePath);
      this.showNewFileDialog = false;
      this.newItemName = '';
    } catch (error) {
      alert('Error al crear archivo: ' + error);
    }
  }

  async createNewFolder() {
    if (!this.newItemName) return;

    try {
      const basePath = this.fileSystemService.getCurrentWorkingDirectory();
      const folderPath = `${basePath}/${this.newItemName}`;
      await this.fileSystemService.createDirectory(folderPath);
      this.showNewFolderDialog = false;
      this.newItemName = '';
    } catch (error) {
      alert('Error al crear carpeta: ' + error);
    }
  }

  async deleteNode(node: FileNode) {
    const confirmMessage = node.type === 'directory'
      ? `¿Eliminar la carpeta "${node.name}" y todo su contenido?`
      : `¿Eliminar el archivo "${node.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      await this.fileSystemService.deleteFile(node.path);
    } catch (error) {
      alert('Error al eliminar: ' + error);
    }
  }

  async renameNode(node: FileNode) {
    const newName = prompt('Nuevo nombre:', node.name);
    if (!newName || newName === node.name) return;

    try {
      const pathParts = node.path.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');
      await this.fileSystemService.renameFile(node.path, newPath);
    } catch (error) {
      alert('Error al renombrar: ' + error);
    }
  }

  closeNewFileDialog() {
    this.showNewFileDialog = false;
    this.newItemName = '';
  }

  closeNewFolderDialog() {
    this.showNewFolderDialog = false;
    this.newItemName = '';
  }
}
