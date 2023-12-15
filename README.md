## Features

This extension simply imitates the behavior of a jump list. To do so, every command that
is supposed to add an entry to the jump list needs to call `jumplist.registerJump`. Then
you can jump around with `jumplist.jumpForward` and `jumplist.jumpBack` without using
VSCode's builtin jump list which records every jump that's more than one line or column.

## Requirements

It is recommended to use the `vscode-neovim` extension alongside this one. Wrap every
neovim call that you want to create a jump point with `jumplist.registerJump` and
overwrite the default `<c-o>` and `<c-i>` behavior with calls to `jumplist.jumpBack` and
`jumplist.jumpForward` respectively.

Some utils I use are:
```lua
-- vscode_utils.lua
function nvim_feedkeys(keys)
    local feedable_keys = vim.api.nvim_replace_termcodes(keys, true, false, true)
    vim.api.nvim_feedkeys(feedable_keys, "n", false)
end

function call(arg)
    nvim_feedkeys(string.format(':call %s<enter>', arg))
end

function vsc_notify(arg)
    call(string.format('VSCodeNotify("%s")', arg))
end

function vsc_call(arg)
    call(string.format('VSCodeCall("%s")', arg))
end

function register_jump()
    vsc_call('jumplist.registerJump')
end

function jump_back()
    vsc_notify('jumplist.jumpBack')
end

function jump_forw()
    vsc_notify('jumplist.jumpForward')
end
```

Now you can wrap any key you want to register in the jump list like this:
```lua
require('vscode_utils')

vim.keymap.set({'n'}, 'i',
    function()
        register_jump()
        nvim_feedkeys('i')
    end
)
```

And you can rebind `<c-i>` and `<c-o>` like this:
```lua
require('vscode_utils')

vim.keymap.set({'n'}, '<c-o>', jump_back, {noremap=true})
vim.keymap.set({'n'}, '<c-i>', jump_forw, {noremap=true})
```

Happy jumping!

## Release Notes

### 0.0.4

- Use linked list instead of array to store jump points

### 0.0.3

- Update jumplist as files change

### 0.0.2

- Fix various bugs
- Remove leftover console log

### 0.0.1

- Initial build
