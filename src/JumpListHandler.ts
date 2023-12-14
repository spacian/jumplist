import * as vscode from "vscode"
import { JumpList } from "./jumplist"
import { JumpPoint } from "./interfaces"

class JumpHandler implements vscode.Disposable {
    private jumpList: JumpList = new JumpList()

    constructor() {}

    private getJumpPoint(context: vscode.ExtensionContext): JumpPoint | null {
        const editor = vscode.window.activeTextEditor
        if (editor) {
            const jumpPoint = new JumpPoint(
                editor.selection.active.line,
                editor.selection.active.character,
                editor.document)
            return jumpPoint
        }
        return null
    }

    public registerJump(context: vscode.ExtensionContext): void {
        const jumpPoint = this.getJumpPoint(context)
        if (jumpPoint != null){
            this.jumpList.registerJump(jumpPoint);
        }
        return
    }

    public jumpForward(context: vscode.ExtensionContext): void {
        const jumpPoint = this.jumpList.jumpForward()
        if (jumpPoint == null){ return }
        this.jumpTo(jumpPoint)
    }

    public jumpBack(context: vscode.ExtensionContext): void {
        const currentPoint = this.getJumpPoint(context)
        const jumpPoint = this.jumpList.jumpBack(currentPoint)
        if (jumpPoint == null){ return }
        this.jumpTo(jumpPoint)
    }

    public dispose(): void {}

    private async jumpTo(jump: JumpPoint) {
        if (jump.doc != null) {
            await vscode.window.showTextDocument(jump.doc);
            if (vscode.window.activeTextEditor
                && vscode.window.activeTextEditor.document === jump.doc) {

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
    const handler = getJumpHandler(context)
    handler.registerJump(context)
};

export function jumpForward(context: vscode.ExtensionContext) {
    const handler = getJumpHandler(context)
    handler.jumpForward(context)
};

export function jumpBack(context: vscode.ExtensionContext) {
    const handler = getJumpHandler(context)
    handler.jumpBack(context)
};
