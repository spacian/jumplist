import * as vscode from "vscode";

export type NJumpPoint = JumpPoint | null

export class JumpPointBaseNode {
    prev: JumpPointNode | null = null;
    next: JumpPointNode | null = null;
    val: NJumpPoint = null;

    public constructor(
        val?: JumpPoint,
        prev?: JumpPointNode | null,
        next?:JumpPointNode | null,
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
        return this.next != null
    }

    public disconnectNext(): void {
        this.next = null;
    }
}

export class JumpPointNode extends JumpPointBaseNode {
    public constructor(val: JumpPoint, prev: JumpPointNode) {
        super(val, prev);
        return;
    }
}

export class JumpPointRoot extends JumpPointBaseNode {
    public constructor() {
        super();
    }
}

export class JumpPoint {
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
            && Math.abs(this.row - other.row) < 3
            && this.doc.fileName == other.doc.fileName
        );
    }
}
