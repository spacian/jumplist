import * as vscode from "vscode";

export interface IJumpPoint {
    row: number;
    col: number;
    doc: vscode.TextDocument;
}
