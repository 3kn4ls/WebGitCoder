import { Component, OnInit, OnDestroy } from '@angular/core';
import { EditorService } from '../../services/editor.service';
import { OpenFile } from '../../models/file-node.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {
  openFiles: OpenFile[] = [];
  activeFile: OpenFile | null = null;

  editorOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    automaticLayout: true,
    fontSize: 14,
    minimap: {
      enabled: true
    },
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    rulers: [80, 120],
    bracketPairColorization: {
      enabled: true
    }
  };

  private subscriptions: Subscription[] = [];

  constructor(private editorService: EditorService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.editorService.openFiles$.subscribe(files => {
        this.openFiles = files;
      })
    );

    this.subscriptions.push(
      this.editorService.activeFile$.subscribe(file => {
        this.activeFile = file;
        if (file) {
          this.editorOptions = {
            ...this.editorOptions,
            language: file.language || 'plaintext'
          };
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onEditorInit(editor: any) {
    // Configuración adicional del editor si es necesaria
    console.log('Monaco Editor initialized');
  }

  onContentChange(content: string) {
    if (this.activeFile) {
      this.editorService.updateFileContent(this.activeFile.path, content);
    }
  }

  switchToFile(file: OpenFile) {
    this.editorService.setActiveFile(file.path);
  }

  closeFile(file: OpenFile, event: Event) {
    event.stopPropagation();

    if (file.isDirty) {
      const shouldClose = confirm(`"${file.name}" tiene cambios sin guardar. ¿Cerrar de todos modos?`);
      if (!shouldClose) return;
    }

    this.editorService.closeFile(file.path);
  }

  async saveCurrentFile() {
    if (this.activeFile && this.activeFile.isDirty) {
      try {
        await this.editorService.saveFile(this.activeFile.path);
      } catch (error) {
        alert('Error al guardar archivo: ' + error);
      }
    }
  }

  async saveAllFiles() {
    try {
      await this.editorService.saveAll();
    } catch (error) {
      alert('Error al guardar archivos: ' + error);
    }
  }

  getFileIcon(file: OpenFile): string {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const iconMap: { [key: string]: string } = {
      'ts': '🔷',
      'js': '🟨',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'txt': '📄'
    };
    return iconMap[extension] || '📄';
  }
}
