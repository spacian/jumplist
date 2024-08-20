import * as vscode from 'vscode';
import { JumpList } from './jump_list';
import { JumpPoint, NJumpPoint } from './jump_point';
import { JumpListUpdater } from './jump_list_updater';


export class JumpHandler implements vscode.Disposable {
    private jumpLists: JumpList[] = [];
    private textDocumentChangeListener: vscode.Disposable | null = null;
    private fileRenameListener: vscode.Disposable | null = null;
    private fileDeletionListener: vscode.Disposable | null = null;

    constructor() {
        const maxSize: number =
                                vscode.workspace
                                .getConfiguration('jumplist')
                                .get('maximumJumpPoints') as number;
        const insertOnJumpForward: boolean =
                                vscode.workspace
                                .getConfiguration('jumplist')
                                .get('insertJumpPointOnForwardJump') as boolean;
        const jumpListCount: number =
                                vscode.workspace
                                .getConfiguration('jumplist')
                                .get('jumpListCount') as number;
        for (let i = 0; i < jumpListCount; i++){
            this.jumpLists.push(new JumpList(maxSize, insertOnJumpForward));
        }
        this.textDocumentChangeListener =
            vscode.workspace.onDidChangeTextDocument((change) => {
                for (const jumpList of this.jumpLists){
                    JumpListUpdater.updateJumpsTextDocumentChange(jumpList, change);
                }
            }
        );
        this.fileRenameListener =
            vscode.workspace.onDidRenameFiles((rename) => {
                for (const jumpList of this.jumpLists) {
                    JumpListUpdater.updateJumpsFileRename(jumpList, rename);
                }
            }
        );
        this.fileDeletionListener =
            vscode.workspace.onDidDeleteFiles((deletion) => {
                for (const jumpList of this.jumpLists) {
                    JumpListUpdater.updateJumpsFileDeletion(jumpList, deletion);
                }
            }
        );
        return;
    }

    private getJumpPoint(): NJumpPoint {
        const editor = vscode.window.activeTextEditor;
        if (editor != undefined && editor.document.uri.path.length > 0) {
            const jumpPoint = new JumpPoint(
                editor.selection.active.line,
                editor.selection.active.character,
                editor.document.uri);
            return jumpPoint;
        }
        return null;
    }

    public registerJump(jumpListId: number): void {
        if (jumpListId >= this.jumpLists.length) {
            return;
        }
        const jumpPoint = this.getJumpPoint();
        if (jumpPoint != null){
            this.jumpLists[jumpListId].registerOrAmendJump(jumpPoint);
        }
        return;
    }

    public jumpForward(jumpListId: number): void {
        if (jumpListId >= this.jumpLists.length) {
            return;
        }
        const currentPoint = this.getJumpPoint();
        if (currentPoint === null) {return;}
        const insert = (jumpListId === 0);
        const jumpPoint = this.jumpLists[jumpListId].jumpForward(currentPoint, insert);
        if (jumpPoint === null){return;}
        this.jumpTo(jumpPoint);
        return;
    }

    public jumpBack(jumpListId: number): void {
        if (jumpListId >= this.jumpLists.length) {
            return;
        }
        const currentPoint = this.getJumpPoint();
        if (currentPoint === null) {return;}
        const insert = (jumpListId === 0);
        const jumpPoint = this.jumpLists[jumpListId].jumpBack(currentPoint, insert);
        if (jumpPoint === null){return;}
        this.jumpTo(jumpPoint);
        return;
    }

    public dispose(): void {
        if (this.textDocumentChangeListener != null) {
            this.textDocumentChangeListener.dispose();
            this.textDocumentChangeListener = null;
        }
        if (this.fileDeletionListener != null) {
            this.fileDeletionListener.dispose();
            this.fileDeletionListener = null;
        }
        if (this.fileRenameListener != null) {
            this.fileRenameListener.dispose();
            this.fileRenameListener = null;
        }
        return;
    }

    private async jumpTo(jump: JumpPoint): Promise<void> {
        if (jump.uri != null) {
            let editor = await vscode.window.showTextDocument(jump.uri);
            if (editor.document.uri.path === jump.uri.path
            ) {
                const jumpPosition = new vscode.Position(jump.row, jump.col);
                const selection = new vscode.Selection(jumpPosition, jumpPosition);
                editor.selection = selection;
                editor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
            }
        }
        return;
    }
}
