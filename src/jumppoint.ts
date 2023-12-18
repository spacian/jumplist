import * as vscode from "vscode";

export type NJumpPoint = JumpPoint | null;
type NJumpPointNode = JumpPointNode | null;

class JumpPointBaseNode {
    prev: NJumpPointNode = null;
    next: NJumpPointNode = null;
    val: NJumpPoint = null;

    public constructor(
        val?: JumpPoint,
        prev?: NJumpPointNode,
        next?: NJumpPointNode,
    ) {
        if (val != undefined) {this.val = val;}
        if (prev != undefined) {this.prev = prev;}
        if (next != undefined) {this.next = next;}
        return;
    }

    public valid(): boolean {
        return this.val != null;
    }

    public hasPrev(): boolean {
        return this.prev != null && this.prev.valid();
    }

    public hasNext(): boolean {
        return this.next != null;
    }

    public disconnectNext(): void {
        this.next = null;
    }
}

export class JumpPointNode extends JumpPointBaseNode {
    public constructor(val: JumpPoint, prev: JumpPointNode, next: NJumpPointNode = null) {
        super(val, prev, next);
        return;
    }
}

export class JumpPointRoot extends JumpPointBaseNode {
    public constructor() {
        super();
    }
}

export class JumpPoint {
    private static combineLineCount: number = vscode.workspace.getConfiguration('jumplist').get('combineLineCount') as number;
    row: number;
    col: number;
    doc: vscode.TextDocument;

    public constructor(row: number, col: number, doc: vscode.TextDocument) {
        this.row = row;
        this.col = col;
        this.doc = doc;
    }

    public equals(other: JumpPoint | null): boolean {
        return (
            other != null
            && Math.abs(this.row - other.row) <= JumpPoint.combineLineCount
            && this.doc.fileName == other.doc.fileName
        );
    }
}
