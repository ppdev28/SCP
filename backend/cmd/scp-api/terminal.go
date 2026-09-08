package main

import (
	"bytes"
	"context"
	"os"
	"os/exec"
	"strings"
	"time"
)

type TerminalExecRequest struct {
	Command string `json:"command"`
	Cwd string `json:"cwd,omitempty"`
}

type TerminalExecResponse struct {
	Output string `json:"output"`
	ExitCode int `json:"exitCode"`
	Cwd string `json:"cwd"`
}

func executeTerminalCommand(parent context.Context, req TerminalExecRequest) (TerminalExecResponse, error) {
	cwd := strings.TrimSpace(req.Cwd)
	if cwd == "" { cwd, _ = os.Getwd() }
	if !strings.HasPrefix(cwd, "/") {
		base, _ := os.Getwd(); cwd = strings.TrimSuffix(base, "/") + "/" + cwd
	}
	if info, err := os.Stat(cwd); err != nil || !info.IsDir() {
		return TerminalExecResponse{Output: "bash: cd: " + cwd + ": No such file or directory\n", ExitCode: 1, Cwd: cwd}, nil
	}

	ctx, cancel := context.WithTimeout(parent, 30*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "bash", "-lc", req.Command)
	cmd.Dir = cwd
	cmd.Env = os.Environ()
	var out bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &out
	err := cmd.Run()
	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok { exitCode = exitErr.ExitCode() } else { exitCode = 124 }
	}
	output := out.String()
	if ctx.Err() == context.DeadlineExceeded { output += "\nbash: command timed out after 30s\n"; exitCode = 124 }
	return TerminalExecResponse{Output: output, ExitCode: exitCode, Cwd: cwd}, nil
}
