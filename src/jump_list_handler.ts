import * as vscode from 'vscode';
import { JumpList } from './jump_list';
import { JumpPoint, NJumpPoint } from './jump_point';
import { JumpListUpdater } from './jump_list_updater';
import { log } from 'console';


class JumpHandler implements vscode.Disposable {
    private jumpList: JumpList;
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
        this.jumpList = new JumpList(maxSize, insertOnJumpForward);
        this.textDocumentChangeListener =
            vscode.workspace.onDidChangeTextDocument((change) => {
                JumpListUpdater.updateJumpsTextDocumentChange(this.jumpList, change);
            }
        );
        this.fileRenameListener =
            vscode.workspace.onDidRenameFiles((rename) => {
                JumpListUpdater.updateJumpsFileRename(this.jumpList, rename);
            }
        );
        this.fileDeletionListener =
            vscode.workspace.onDidDeleteFiles((deletion) => {
                JumpListUpdater.updateJumpsFileDeletion(this.jumpList, deletion);
            }
        );
    }

    private getJumpPoint(): NJumpPoint {
        const editor = vscode.window.activeTextEditor;
        if (editor != undefined && editor.document.uri.scheme === "file") {
            const jumpPoint = new JumpPoint(
                editor.selection.active.line,
                editor.selection.active.character,
                editor.document.uri);
            return jumpPoint;
        }
        return null;
    }

    public registerJump(): void {
        const jumpPoint = this.getJumpPoint();
        if (jumpPoint != null){
            this.jumpList.registerOrAmendJump(jumpPoint);
        }
        return;
    }

    public jumpForward(): void {
        const currentPoint = this.getJumpPoint();
        if (currentPoint === null) {return;}
        const jumpPoint = this.jumpList.jumpForward(currentPoint);
        if (jumpPoint === null){return;}
        this.jumpTo(jumpPoint);
        return;
    }

    public jumpBack(): void {
        const currentPoint = this.getJumpPoint();
        if (currentPoint === null) {return;}
        const jumpPoint = this.jumpList.jumpBack(currentPoint);
        if (jumpPoint === null){return;}
        this.jumpTo(jumpPoint);
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

    private jumpTo(jump: JumpPoint): void {
        if (jump.uri != null) {
            vscode.window.showTextDocument(jump.uri);
            if (vscode.window.activeTextEditor
                && vscode.window.activeTextEditor.document.uri.path === jump.uri.path
            ) {
                const jumpPosition = new vscode.Position(jump.row, jump.col);
                const selection = new vscode.Selection(jumpPosition, jumpPosition);
                vscode.window.activeTextEditor.selection = selection;
                vscode.window.activeTextEditor.revealRange(
                    selection, vscode.TextEditorRevealType.InCenter
                );
            }
        }
        return;
    }
}

let jumpHandler: JumpHandler | null = null;
function getJumpHandler(context: vscode.ExtensionContext): JumpHandler {
    if (jumpHandler === null) {
        jumpHandler = new JumpHandler();
        context.subscriptions.push(jumpHandler);
    }
    return jumpHandler;
}

export function registerJump(context: vscode.ExtensionContext): void {
    const handler = getJumpHandler(context);
    handler.registerJump();
    return;
}

export function jumpForward(context: vscode.ExtensionContext): void {
    const handler = getJumpHandler(context);
    handler.jumpForward();
    return;
}

export function jumpBack(context: vscode.ExtensionContext): void {
    const handler = getJumpHandler(context);
    handler.jumpBack();
    return;
}
