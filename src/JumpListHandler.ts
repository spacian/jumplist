import * as vscode from 'vscode';
import { JumpList } from './jumplist';
import { JumpPoint, NJumpPoint } from './jumppoint';
import { JumpListUpdater } from './jumplistupdater';


class JumpHandler implements vscode.Disposable {
    private static max_size: number = vscode.workspace.getConfiguration('jumplist').get('maximumJumpPoints') as number;
    private jumpList: JumpList = new JumpList(JumpHandler.max_size);
    private textEditorChangeListener: vscode.Disposable | null = null;

    constructor() {
        this.textEditorChangeListener = vscode.workspace.onDidChangeTextDocument((e) => {
                JumpListUpdater.updateJumps(this.jumpList, e);
            }
        )
    }

    private getJumpPoint(): NJumpPoint {
        const editor = vscode.window.activeTextEditor;
        if (editor != undefined) {
            const jumpPoint = new JumpPoint(
                editor.selection.active.line,
                editor.selection.active.character,
                editor.document);
            return jumpPoint;
        }
        return null;
    }

    public registerJump(): void {
        const jumpPoint = this.getJumpPoint();
        if (jumpPoint != null){
            this.jumpList.registerJump(jumpPoint);
        }
        return;
    }

    public jumpForward(): void {
        const currentPoint = this.getJumpPoint();
        const jumpPoint = this.jumpList.jumpForward(currentPoint);
        if (jumpPoint == null){return;}
        this.jumpTo(jumpPoint);
        return;
    }

    public jumpBack(): void {
        const currentPoint = this.getJumpPoint();
        const jumpPoint = this.jumpList.jumpBack(currentPoint);
        if (jumpPoint == null){return;}
        this.jumpTo(jumpPoint);
    }

    public dispose(): void {
        if (this.textEditorChangeListener) {
            this.textEditorChangeListener.dispose();
            this.textEditorChangeListener = null;
        }
        return;
    }

    private jumpTo(jump: JumpPoint) {
        if (jump.doc != null) {
            vscode.window.showTextDocument(jump.doc);
            if (vscode.window.activeTextEditor
                && vscode.window.activeTextEditor.document === jump.doc
            ) {
                const jumpPosition = new vscode.Position(jump.row, jump.col);
                const selection = new vscode.Selection(jumpPosition, jumpPosition);
                vscode.window.activeTextEditor.selection = selection;
                vscode.window.activeTextEditor.revealRange(
                    selection, vscode.TextEditorRevealType.InCenter
                );
            }
        }
    }
}

let jumpHandler: JumpHandler | null = null;
function getJumpHandler(context: vscode.ExtensionContext): JumpHandler {
    if (jumpHandler == null) {
        jumpHandler = new JumpHandler();
        context.subscriptions.push(jumpHandler);
    }
    return jumpHandler;
}

export function registerJump(context: vscode.ExtensionContext) {
    const handler = getJumpHandler(context);
    handler.registerJump();
}

export function jumpForward(context: vscode.ExtensionContext) {
    const handler = getJumpHandler(context);
    handler.jumpForward();
}

export function jumpBack(context: vscode.ExtensionContext) {
    const handler = getJumpHandler(context);
    handler.jumpBack();
}
