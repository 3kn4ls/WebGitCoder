import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FileSystemService } from './file-system.service';
// @ts-ignore
import git from 'isomorphic-git';
// @ts-ignore
import http from 'isomorphic-git/http/web';

export interface GitStatus {
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
}

export interface GitCommit {
  oid: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GitService {
  private statusSubject = new BehaviorSubject<GitStatus>({
    modified: [],
    added: [],
    deleted: [],
    untracked: []
  });
  public status$ = this.statusSubject.asObservable();

  private commitsSubject = new BehaviorSubject<GitCommit[]>([]);
  public commits$ = this.commitsSubject.asObservable();

  private fs: any;
  private dir: string;

  constructor(private fileSystemService: FileSystemService) {
    this.fs = fileSystemService.getFS();
    this.dir = fileSystemService.getCurrentWorkingDirectory();
  }

  async clone(url: string, username?: string, password?: string): Promise<void> {
    try {
      const corsProxy = 'https://cors.isomorphic-git.org';

      const auth = username && password ? {
        username,
        password
      } : undefined;

      await git.clone({
        fs: this.fs,
        http,
        dir: this.dir,
        url,
        corsProxy,
        auth,
        singleBranch: true,
        depth: 1,
        onProgress: (progress: any) => {
          console.log('Clone progress:', progress);
        }
      });

      await this.fileSystemService.refreshFileTree();
      await this.refreshStatus();
      await this.loadCommits();
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw error;
    }
  }

  async init(): Promise<void> {
    try {
      await git.init({
        fs: this.fs,
        dir: this.dir,
        defaultBranch: 'main'
      });
      await this.refreshStatus();
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw error;
    }
  }

  async add(filepath: string): Promise<void> {
    try {
      await git.add({
        fs: this.fs,
        dir: this.dir,
        filepath
      });
      await this.refreshStatus();
    } catch (error) {
      console.error('Error adding file:', error);
      throw error;
    }
  }

  async addAll(): Promise<void> {
    try {
      const status = await this.getStatus();
      const allFiles = [
        ...status.modified,
        ...status.untracked,
        ...status.deleted
      ];

      for (const file of allFiles) {
        if (status.deleted.includes(file)) {
          await git.remove({
            fs: this.fs,
            dir: this.dir,
            filepath: file
          });
        } else {
          await git.add({
            fs: this.fs,
            dir: this.dir,
            filepath: file
          });
        }
      }

      await this.refreshStatus();
    } catch (error) {
      console.error('Error adding all files:', error);
      throw error;
    }
  }

  async commit(message: string, author?: { name: string; email: string }): Promise<string> {
    try {
      const defaultAuthor = {
        name: 'WebGitCoder User',
        email: 'user@webgitcoder.local'
      };

      const sha = await git.commit({
        fs: this.fs,
        dir: this.dir,
        message,
        author: author || defaultAuthor
      });

      await this.refreshStatus();
      await this.loadCommits();
      return sha;
    } catch (error) {
      console.error('Error committing:', error);
      throw error;
    }
  }

  async push(username?: string, password?: string, force = false): Promise<void> {
    try {
      const corsProxy = 'https://cors.isomorphic-git.org';

      const auth = username && password ? {
        username,
        password
      } : undefined;

      await git.push({
        fs: this.fs,
        http,
        dir: this.dir,
        corsProxy,
        auth,
        force,
        onProgress: (progress: any) => {
          console.log('Push progress:', progress);
        }
      });
    } catch (error) {
      console.error('Error pushing:', error);
      throw error;
    }
  }

  async pull(username?: string, password?: string): Promise<void> {
    try {
      const corsProxy = 'https://cors.isomorphic-git.org';

      const auth = username && password ? {
        username,
        password
      } : undefined;

      await git.pull({
        fs: this.fs,
        http,
        dir: this.dir,
        corsProxy,
        auth,
        singleBranch: true,
        onProgress: (progress: any) => {
          console.log('Pull progress:', progress);
        }
      });

      await this.fileSystemService.refreshFileTree();
      await this.refreshStatus();
      await this.loadCommits();
    } catch (error) {
      console.error('Error pulling:', error);
      throw error;
    }
  }

  async getStatus(): Promise<GitStatus> {
    try {
      const FILE = 0, WORKDIR = 2, STAGE = 3;
      const status: GitStatus = {
        modified: [],
        added: [],
        deleted: [],
        untracked: []
      };

      const files = await git.listFiles({ fs: this.fs, dir: this.dir });

      for (const filepath of files) {
        const fileStatus = await git.status({
          fs: this.fs,
          dir: this.dir,
          filepath
        });

        if (fileStatus === 'modified') {
          status.modified.push(filepath);
        } else if (fileStatus === 'added') {
          status.added.push(filepath);
        } else if (fileStatus === 'deleted') {
          status.deleted.push(filepath);
        } else if (fileStatus === '*added') {
          status.untracked.push(filepath);
        }
      }

      return status;
    } catch (error) {
      console.error('Error getting status:', error);
      return {
        modified: [],
        added: [],
        deleted: [],
        untracked: []
      };
    }
  }

  async refreshStatus(): Promise<void> {
    const status = await this.getStatus();
    this.statusSubject.next(status);
  }

  async loadCommits(limit = 50): Promise<void> {
    try {
      const logs = await git.log({
        fs: this.fs,
        dir: this.dir,
        depth: limit
      });

      const commits: GitCommit[] = logs.map((log: any) => ({
        oid: log.oid,
        message: log.commit.message,
        author: {
          name: log.commit.author.name,
          email: log.commit.author.email
        },
        timestamp: log.commit.author.timestamp * 1000
      }));

      this.commitsSubject.next(commits);
    } catch (error) {
      console.error('Error loading commits:', error);
      this.commitsSubject.next([]);
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      return await git.currentBranch({
        fs: this.fs,
        dir: this.dir,
        fullname: false
      }) || 'main';
    } catch (error) {
      console.error('Error getting current branch:', error);
      return 'main';
    }
  }

  async listBranches(): Promise<string[]> {
    try {
      return await git.listBranches({
        fs: this.fs,
        dir: this.dir
      });
    } catch (error) {
      console.error('Error listing branches:', error);
      return [];
    }
  }

  async checkout(branch: string): Promise<void> {
    try {
      await git.checkout({
        fs: this.fs,
        dir: this.dir,
        ref: branch
      });
      await this.fileSystemService.refreshFileTree();
      await this.refreshStatus();
    } catch (error) {
      console.error('Error checking out branch:', error);
      throw error;
    }
  }
}
