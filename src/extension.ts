import * as vscode from 'vscode';
import { registerJump, jumpForward, jumpBack } from './handler_singleton';

function getCommand(name: string, i: number) : string {
    if (i > 0) {
        return name.concat(i.toString());
    }
    return name;
}

export function activate(context: vscode.ExtensionContext) : void {
    const jumpListCount: number =
                                vscode.workspace
                                .getConfiguration('jumplist')
                                .get('jumpListCount') as number;

    for (let i = 0; i < jumpListCount; i++) {
        const registerJumpString  = getCommand("jumplist.registerJump", i);
        const registerJumpDisposable = vscode.commands.registerCommand(
            registerJumpString, () => { registerJump(context, i); }
        );
        context.subscriptions.push(registerJumpDisposable);

        const jumpForwardString  = getCommand("jumplist.jumpForward", i);
        const jumpForwardDisposable = vscode.commands.registerCommand(
            jumpForwardString, () => { jumpForward(context, i); }
        );
        context.subscriptions.push(jumpForwardDisposable);

        const jumpBackString  = getCommand("jumplist.jumpBack", i);
        const jumpBackDisposable = vscode.commands.registerCommand(
            jumpBackString, () => { jumpBack(context, i); }
        );
        context.subscriptions.push(jumpBackDisposable);
    }
    return;
}

export function deactivate() : void {
    return;
}
