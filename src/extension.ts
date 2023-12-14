import * as vscode from 'vscode';
import { registerJump, jumpForward, jumpBack } from "./JumpListHandler"

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "jumplist" is now active!');
    const registerJumpDisposable = vscode.commands.registerCommand(
        "jumplist.registerJump", () => {
            registerJump(context);
        }
    );
    const jumpForwardDisposable = vscode.commands.registerCommand(
        "jumplist.jumpForward", () => {
            jumpForward(context);
        }
    );
    const jumpBackDisposable = vscode.commands.registerCommand(
        "jumplist.jumpBack", () => {
            jumpBack(context);
        }
    );
    context.subscriptions.push(registerJumpDisposable);
    context.subscriptions.push(jumpForwardDisposable);
    context.subscriptions.push(jumpBackDisposable);
}

export function deactivate() {}