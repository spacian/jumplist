import * as vscode from 'vscode';
import { registerJump, jumpForward, jumpBack } from './jump_list_handler';

export function activate(context: vscode.ExtensionContext) {
    const jumpListCount: number =
                            vscode.workspace
                            .getConfiguration('jumplist')
                            .get('jumpListCount') as number;
    for (let i = 0; i < jumpListCount; i++){
        let registerJumpString  = "jumplist.registerJump"
        if (i > 0) {
            registerJumpString = registerJumpString.concat(i.toString());
        }
        const registerJumpDisposable = vscode.commands.registerCommand(
            registerJumpString, () => {
                registerJump(context, i);
            }
        );
        let jumpForwardString  = "jumplist.jumpForward"
        if (i > 0) {
            jumpForwardString = jumpForwardString.concat(i.toString());
        }
        const jumpForwardDisposable = vscode.commands.registerCommand(
            jumpForwardString, () => {
                jumpForward(context, i);
            }
        );
        let jumpBackString  = "jumplist.jumpBack"
        if (i > 0) {
            jumpBackString = jumpBackString.concat(i.toString());
        }
        const jumpBackDisposable = vscode.commands.registerCommand(
            jumpBackString, () => {
                jumpBack(context, i);
            }
        );
        context.subscriptions.push(registerJumpDisposable);
        context.subscriptions.push(jumpForwardDisposable);
        context.subscriptions.push(jumpBackDisposable);
    }
}

export function deactivate() {}
