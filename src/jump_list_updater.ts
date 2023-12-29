import * as vscode from 'vscode';
import { JumpPoint, JumpPointNode } from './jump_point';
import { JumpList } from './jump_list';


export class JumpListUpdater {

    public static updateJumpsTextDocumentChange(
        jumpList: JumpList,
        changeEvent: vscode.TextDocumentChangeEvent
    ): void {
        let node = jumpList.getRoot();
        while (node.hasNext()) {
            node = node.next!;
            const jump = node.val!;
            if (jump.uri.path === changeEvent.document.uri.path) {
                for (const change of changeEvent.contentChanges) {
                    JumpListUpdater.updateJumpTextDocumentChange(jump, change);
                }
            }
        }
        return;
    }

    public static updateJumpsFileDeletion(
        jumpList: JumpList,
        deletionEvent: vscode.FileDeleteEvent
    ): void {
        let node = jumpList.getRoot() as JumpPointNode;
        while (node.hasNext()) {
            node = node.next!;
            const nodePath = node.val!.uri.path;
            for (const deletion of deletionEvent.files) {
                if (nodePath === deletion.path){
                    jumpList.deleteNode(node);
                    break;
                }
            }
        }
        return;
    }

    public static async updateJumpsFileRename(
        jumpList: JumpList,
        renameEvent: vscode.FileRenameEvent
    ): Promise<void> {
        let node = jumpList.getRoot() as JumpPointNode;
        while (node.hasNext()) {
            node = node.next!;
            const nodePath = node.val!.uri.path;
            for (const rename of renameEvent.files) {
                if (nodePath === rename.oldUri.path){
                    node.val!.uri = rename.newUri;
                    break;
                }
            }
        }
        return;
    }

    private static updateJumpTextDocumentChange(
            jump: JumpPoint,
            event: vscode.TextDocumentContentChangeEvent,
    ): void {
        const rel = JumpListUpdater.getJumpRelativity(jump, event.range);
        if (rel === 0) {
            JumpListUpdater.updateJumpWithChangeAtLine(jump, event);
        } else if (rel === 1) {
            JumpListUpdater.updateJumpWithChangeBeforeLine(jump, event);
        }
        return;
    }

    private static getJumpRelativity(jump: JumpPoint, range: vscode.Range): number {
        if (jump.row > range.end.line) {return 1;}
        if (jump.row < range.start.line) {return -1;}

        if (jump.row === range.end.line) {
            if (jump.col < range.start.character) {return -1;}
            if (jump.col >= range.end.character) {return 1;}
        }
        return 0;
    }

    private static updateJumpWithChangeAtLine(
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

    private static updateJumpWithChangeBeforeLine(
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
}
