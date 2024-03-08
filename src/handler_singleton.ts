import * as vscode from 'vscode';
import { JumpHandler } from './jump_list_handler';

let jumpHandler: JumpHandler | null = null;

function getJumpHandler(context: vscode.ExtensionContext): JumpHandler {
    if (jumpHandler === null) {
        jumpHandler = new JumpHandler();
        context.subscriptions.push(jumpHandler);
    }
    return jumpHandler;
}

export function registerJump(context: vscode.ExtensionContext, jumpListId: number): void {
    const handler = getJumpHandler(context);
    handler.registerJump(jumpListId);
    return;
}

export function jumpForward(context: vscode.ExtensionContext, jumpListId: number): void {
    const handler = getJumpHandler(context);
    handler.jumpForward(jumpListId);
    return;
}

export function jumpBack(context: vscode.ExtensionContext, jumpListId: number): void {
    const handler = getJumpHandler(context);
    handler.jumpBack(jumpListId);
    return;
}
