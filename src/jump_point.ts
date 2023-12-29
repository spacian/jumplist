import * as vscode from "vscode";

export type NJumpPoint = JumpPoint | null;
type NJumpPointNode = JumpPointNode | null;

class JumpPointBaseNode {
    public prev: NJumpPointNode = null;
    public next: NJumpPointNode = null;
    public val: NJumpPoint = null;

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

    public delete(): void {
        this.prev!.next = this.next;
        if (this.next != null) {
            this.next.prev = this.prev;
        }
        return;
    }
}

export class JumpPointNode extends JumpPointBaseNode {
    public constructor(
        val: JumpPoint,
        prev: JumpPointNode,
        next: NJumpPointNode = null,
    ) {
        super(val, prev, next);
        return;
    }
}

export class JumpPointRoot extends JumpPointBaseNode {
    public constructor() {
        super();
    }
    public delete(): void {return;}
}

export class JumpPoint {
    private static combineLineCount: number =
        vscode.workspace.getConfiguration('jumplist').get('combineLineCount') as number;
    public row: number;
    public col: number;
    public uri: vscode.Uri;

    public constructor(row: number, col: number, uri: vscode.Uri) {
        this.row = row;
        this.col = col;
        this.uri = uri;
    }

    public equals(other: NJumpPoint): boolean {
        return (
            other != null
            && Math.abs(this.row - other.row) <= JumpPoint.combineLineCount
            && this.uri.path === other.uri.path
        );
    }
    public equalsStrict(other: NJumpPoint): boolean {
        return (
            other != null
            && this.row === other.row
            && this.uri.path === other.uri.path
        );
    }
}
