import * as vscode from "vscode";

export type NJumpPoint = JumpPoint | null

export class JumpPoint {
    row: number;
    col: number;
    doc: vscode.TextDocument;

    public constructor(row: number, col: number, doc: vscode.TextDocument) {
        this.row = row
        this.col = col
        this.doc = doc
    }

    public equals(other: JumpPoint | null): boolean {
        return (
            other != null
            && this.row == other.row
            && this.doc.fileName == other.doc.fileName
        )
    }
}
