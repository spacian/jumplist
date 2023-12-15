# jumplist README

Quickly jump from one point to another, imitating the neovim jump list.

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
