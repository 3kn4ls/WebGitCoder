import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpenFile } from '../models/file-node.model';
import { FileSystemService } from './file-system.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private openFilesSubject = new BehaviorSubject<OpenFile[]>([]);
  public openFiles$ = this.openFilesSubject.asObservable();

  private activeFileSubject = new BehaviorSubject<OpenFile | null>(null);
  public activeFile$ = this.activeFileSubject.asObservable();

  constructor(private fileSystemService: FileSystemService) {}

  async openFile(path: string): Promise<void> {
    try {
      const openFiles = this.openFilesSubject.value;
      const existingFile = openFiles.find(f => f.path === path);

      if (existingFile) {
        this.activeFileSubject.next(existingFile);
        return;
      }

      const content = await this.fileSystemService.readFile(path);
      const fileName = path.split('/').pop() || '';
      const language = this.getLanguageFromFileName(fileName);

      const newFile: OpenFile = {
        path,
        name: fileName,
        content,
        isDirty: false,
        language
      };

      this.openFilesSubject.next([...openFiles, newFile]);
      this.activeFileSubject.next(newFile);
    } catch (error) {
      console.error('Error opening file:', error);
      throw error;
    }
  }

  closeFile(path: string): void {
    const openFiles = this.openFilesSubject.value;
    const index = openFiles.findIndex(f => f.path === path);

    if (index === -1) return;

    const newOpenFiles = openFiles.filter(f => f.path !== path);
    this.openFilesSubject.next(newOpenFiles);

    const activeFile = this.activeFileSubject.value;
    if (activeFile?.path === path) {
      if (newOpenFiles.length > 0) {
        const newIndex = Math.min(index, newOpenFiles.length - 1);
        this.activeFileSubject.next(newOpenFiles[newIndex]);
      } else {
        this.activeFileSubject.next(null);
      }
    }
  }

  setActiveFile(path: string): void {
    const openFiles = this.openFilesSubject.value;
    const file = openFiles.find(f => f.path === path);
    if (file) {
      this.activeFileSubject.next(file);
    }
  }

  updateFileContent(path: string, content: string): void {
    const openFiles = this.openFilesSubject.value;
    const fileIndex = openFiles.findIndex(f => f.path === path);

    if (fileIndex === -1) return;

    const updatedFile = {
      ...openFiles[fileIndex],
      content,
      isDirty: true
    };

    const newOpenFiles = [...openFiles];
    newOpenFiles[fileIndex] = updatedFile;

    this.openFilesSubject.next(newOpenFiles);

    if (this.activeFileSubject.value?.path === path) {
      this.activeFileSubject.next(updatedFile);
    }
  }

  async saveFile(path: string): Promise<void> {
    const openFiles = this.openFilesSubject.value;
    const file = openFiles.find(f => f.path === path);

    if (!file) return;

    try {
      await this.fileSystemService.writeFile(path, file.content);

      const updatedFile = { ...file, isDirty: false };
      const newOpenFiles = openFiles.map(f =>
        f.path === path ? updatedFile : f
      );

      this.openFilesSubject.next(newOpenFiles);

      if (this.activeFileSubject.value?.path === path) {
        this.activeFileSubject.next(updatedFile);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  async saveAll(): Promise<void> {
    const openFiles = this.openFilesSubject.value;
    const dirtyFiles = openFiles.filter(f => f.isDirty);

    for (const file of dirtyFiles) {
      await this.saveFile(file.path);
    }
  }

  private getLanguageFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const languageMap: { [key: string]: string } = {
      'ts': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'txt': 'plaintext'
    };

    return languageMap[extension] || 'plaintext';
  }

  closeAllFiles(): void {
    this.openFilesSubject.next([]);
    this.activeFileSubject.next(null);
  }
}
