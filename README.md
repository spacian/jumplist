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

-- register a jump after insert mode is left
vim.keymap.set({'i'}, '<escape>',
    function()
        nvim_feedkeys('<escape>')
        register_jump()
    end
)

-- register a jump whenever a forward search is started
vim.keymap.set({'n'}, '/',
    function()
        register_jump()
        nvim_feedkeys('/')
    end
)
```

And you can rebind `<c-i>` and `<c-o>` like this:
```lua
require('vscode_utils')

vim.keymap.set({'n'}, '<c-o>', jump_back, {noremap=true})
vim.keymap.set({'n'}, '<c-i>', jump_forw, {noremap=true})
```

Since version 0.0.11, multiple jump lists can be managed. First, the corresponding
setting ("Jump List Count") needs to be set to the corresponding value. Afterwards,
additional commands are available: The first set of extra commands extends the existing
commands with the number "1", the second with number "2" and so on. For example, with a
jump list count of 2, the following commands will become available (after a reload):

```
jumplist.jumpForward1
jumplist.jumpBackwards1
jumplist.registerJump1
```

They are different in that they won't register jumps automatically at all (in contrast to the default jump list, which does so occasionally for convenience reasons). This is to give you full control over which entries will be added to these lists.

Happy jumping!

## Release Notes

### 0.0.11

- Enable use of multiple parallel jump lists

### 0.0.10

- Enable jump point creation for all uris with a path

### 0.0.9

- Prevent jump point creation on non-file uris

### 0.0.8

- Update jump points and jump list on file renames and deletions

### 0.0.7

- Improve end of jump list behavior

### 0.0.6

- Add configuration option `jumplist.insertJumpPointOnForwardJump`

### 0.0.5

- Add configuration options `jumplist.maxJumpPoints` and `jumplist.combineLineCount`
- Fix bug that lead to jump points not being removed properly


### 0.0.4

- Use linked list instead of array to store jump points

### 0.0.3

- Update jumplist as files change

### 0.0.2

- Fix various bugs
- Remove leftover console log

### 0.0.1

- Initial build
