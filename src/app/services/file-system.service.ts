import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileNode } from '../models/file-node.model';
// @ts-ignore
import LightningFS from 'lightning-fs';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  private fs: any;
  private fileTreeSubject = new BehaviorSubject<FileNode[]>([]);
  public fileTree$ = this.fileTreeSubject.asObservable();

  private currentWorkingDirectory = '/workspace';

  constructor() {
    this.fs = new LightningFS('web-git-coder-fs');
    this.initializeFileSystem();
  }

  private async initializeFileSystem() {
    try {
      // Crear directorio de trabajo
      await this.fs.promises.mkdir(this.currentWorkingDirectory).catch(() => {});
      await this.refreshFileTree();
    } catch (error) {
      console.error('Error initializing file system:', error);
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      const content = await this.fs.promises.readFile(path, { encoding: 'utf8' });
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await this.fs.promises.writeFile(path, content, { encoding: 'utf8' });
      await this.refreshFileTree();
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }

  async createFile(path: string): Promise<void> {
    try {
      await this.fs.promises.writeFile(path, '', { encoding: 'utf8' });
      await this.refreshFileTree();
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }

  async createDirectory(path: string): Promise<void> {
    try {
      await this.fs.promises.mkdir(path);
      await this.refreshFileTree();
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const stat = await this.fs.promises.stat(path);
      if (stat.isDirectory()) {
        await this.deleteDirectoryRecursive(path);
      } else {
        await this.fs.promises.unlink(path);
      }
      await this.refreshFileTree();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  private async deleteDirectoryRecursive(path: string): Promise<void> {
    const files = await this.fs.promises.readdir(path);
    for (const file of files) {
      const filePath = `${path}/${file}`;
      const stat = await this.fs.promises.stat(filePath);
      if (stat.isDirectory()) {
        await this.deleteDirectoryRecursive(filePath);
      } else {
        await this.fs.promises.unlink(filePath);
      }
    }
    await this.fs.promises.rmdir(path);
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      await this.fs.promises.rename(oldPath, newPath);
      await this.refreshFileTree();
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  }

  async refreshFileTree(): Promise<void> {
    try {
      const tree = await this.buildFileTree(this.currentWorkingDirectory);
      this.fileTreeSubject.next(tree);
    } catch (error) {
      console.error('Error refreshing file tree:', error);
    }
  }

  private async buildFileTree(path: string): Promise<FileNode[]> {
    try {
      const files = await this.fs.promises.readdir(path);
      const nodes: FileNode[] = [];

      for (const file of files) {
        if (file === '.git') continue; // Ocultar .git

        const filePath = `${path}/${file}`;
        const stat = await this.fs.promises.stat(filePath);

        const node: FileNode = {
          name: file,
          path: filePath,
          type: stat.isDirectory() ? 'directory' : 'file',
          isExpanded: false
        };

        if (stat.isDirectory()) {
          node.children = await this.buildFileTree(filePath);
        }

        nodes.push(node);
      }

      return nodes.sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error building file tree:', error);
      return [];
    }
  }

  getFS() {
    return this.fs;
  }

  getCurrentWorkingDirectory(): string {
    return this.currentWorkingDirectory;
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      await this.fs.promises.stat(path);
      return true;
    } catch {
      return false;
    }
  }
}
