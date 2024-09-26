import * as vscode from "vscode";

export type NJumpPoint = JumpPoint | null;
type NJumpPointBaseNode = JumpPointNode | null;

class JumpPointBaseNode {
    private prev: NJumpPointBaseNode = null;
    private next: NJumpPointBaseNode = null;
    public val: NJumpPoint = null;

    public constructor(
        val?: JumpPoint,
        prev?: JumpPointBaseNode,
        next?: JumpPointBaseNode,
    ) {
        if (val != undefined) {this.val = val;}
        if (prev != undefined) {this.prev = prev;}
        if (next != undefined) {this.next = next;}
        return;
    }

    public valid(): boolean {
        return !this.isRoot() && this.prev != null && this.next != null;
    }

    public hasPrev(): boolean {
        return !this.prev!.isRoot();
    }

    public hasNext(): boolean {
        return !this.next!.isRoot();
    }

    public getPrev(): JumpPointBaseNode {
        return this.prev!;
    }

    public getNext(): JumpPointBaseNode {
        return this.next!;
    }

    public setNext(node: JumpPointBaseNode): void {
        this.next = node;
        return;
    }

    public setPrev(node: JumpPointBaseNode): void {
        this.prev = node;
        return;
    }

    public delete(): void {
        this.prev!.next = this.next;
        this.next!.prev = this.prev;
        this.prev = null;
        this.next = null;
        this.val = null;
        return;
    }

    public isRoot(): boolean {
        return this.val === null;
    }
}

export class JumpPointNode extends JumpPointBaseNode {
    public constructor(
        val: JumpPoint,
        prev: JumpPointBaseNode,
        next: JumpPointBaseNode,
    ) {
        super(val, prev, next);
        return;
    }
}

export class JumpPointRoot extends JumpPointBaseNode {
    public constructor() {
        super();
        this.setPrev(this);
        this.setNext(this);
        return;
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
            && this.uri.fsPath === other.uri.fsPath
        );
    }

    public equalsStrict(other: NJumpPoint): boolean {
        return (
            other != null
            && this.row - other.row === 0
            && this.uri.fsPath === other.uri.fsPath
        );
    }

    public update(row: number, col: number, uri?: vscode.Uri) {
        this.row = row;
        this.col = col;
        if (uri != undefined) {
            this.uri = uri;
        }
        return;
    }
}
