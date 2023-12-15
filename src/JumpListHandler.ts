import * as vscode from "vscode"
import { JumpList } from "./jumplist"
import { JumpPoint, JumpPointBaseNode, NJumpPoint } from "./interfaces"

class JumpHandler implements vscode.Disposable {
    private jumpList: JumpList = new JumpList();
    private textEditorChangeListener: vscode.Disposable | null = null;

    constructor() {
        this.textEditorChangeListener = vscode.workspace.onDidChangeTextDocument((e) => {
                this.updateJumps(e);
            }
        )
    }

    private updateJumps(changeEvent: vscode.TextDocumentChangeEvent): void {
        let node = this.jumpList.getRoot() as JumpPointBaseNode
        while (node.hasNext()) {
            node = node.next as JumpPointBaseNode
            const jump = node.val as JumpPoint
            if (jump.doc === changeEvent.document) {
                for (const change of changeEvent.contentChanges) {
                    this.updateJump(jump, change);
                }
            }
        }
        return;
    }

    private updateJumpWithChangeAtLine(
            jump: JumpPoint,
            changeEvent: vscode.TextDocumentContentChangeEvent,
            ): void {
        const range = changeEvent.range;
        const lines = changeEvent.text.split("\n");
        const multiline = lines.length > 1;
        if (multiline) {
            jump.row = range.start.line + lines.length - 1;
            jump.col = range.end.character + lines[lines.length - 1].length;
        } else {
            jump.row = range.start.line;
            jump.col = range.start.character + lines[lines.length - 1].length;
        }
        return;
    }

    private updateJumpWithChangeBeforeLine(
            jump: JumpPoint,
            event: vscode.TextDocumentContentChangeEvent,
            ): void {
        const range = event.range;
        const lines = event.text.split("\n");
        const multiline = lines.length > 1;
        if (range.end.line === jump.row) {
            const lastLine = lines[lines.length - 1];
            if (multiline) {
                jump.col += lastLine.length - range.end.character;
            } else {
                jump.col += lastLine.length - (range.end.character - range.start.character);
            }
        }
        jump.row += lines.length - (range.end.line - range.start.line) - 1;
        return;
    }

    private updateJump(
            jump: JumpPoint,
            event: vscode.TextDocumentContentChangeEvent,
            ): void {
        const rel = this.getJumpRelativity(jump, event.range);
        if (rel === 0) {
            this.updateJumpWithChangeAtLine(jump, event);
        } else if (rel === 1) {
            this.updateJumpWithChangeBeforeLine(jump, event);
        }
        return;
    }

    private getJumpRelativity(jump: JumpPoint, range: vscode.Range): number {
        if (jump.row > range.end.line) { return 1; }
        if (jump.row < range.start.line) { return -1; }

        if (jump.row === range.end.line) {
            if (jump.col < range.start.character) { return -1; }
            if (jump.col >= range.end.character) { return 1; }
        }
        return 0;
    }


    private getJumpPoint(context: vscode.ExtensionContext): NJumpPoint {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const jumpPoint = new JumpPoint(
                editor.selection.active.line,
                editor.selection.active.character,
                editor.document);
            return jumpPoint;
        }
        return null;
    }

    public registerJump(context: vscode.ExtensionContext): void {
        const jumpPoint = this.getJumpPoint(context);
        if (jumpPoint != null){
            this.jumpList.registerJump(jumpPoint);
        }
        return;
    }

    public jumpForward(context: vscode.ExtensionContext): void {
        const jumpPoint = this.jumpList.jumpForward();
        if (jumpPoint == null){ return; }
        this.jumpTo(jumpPoint);
        return;
    }

    public jumpBack(context: vscode.ExtensionContext): void {
        const currentPoint = this.getJumpPoint(context);
        const jumpPoint = this.jumpList.jumpBack(currentPoint);
        if (jumpPoint == null){ return; }
        this.jumpTo(jumpPoint);
    }

    public dispose(): void {
        if (this.textEditorChangeListener) {
            this.textEditorChangeListener.dispose();
            this.textEditorChangeListener = null;
        }
        return
    }

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
    const handler = getJumpHandler(context);
    handler.registerJump(context);
};

export function jumpForward(context: vscode.ExtensionContext) {
    const handler = getJumpHandler(context);
    handler.jumpForward(context);
};

export function jumpBack(context: vscode.ExtensionContext) {
    const handler = getJumpHandler(context);
    handler.jumpBack(context);
};
