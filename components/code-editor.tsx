"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { File, Plus, Save, Copy, Trash, Paperclip, Play, X, FolderOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Editor from "react-simple-code-editor"
import Prism from "prismjs"
import "prismjs/components/prism-lua" // Base Lua syntax
import "./prism-luau.css" // Import our custom CSS

// Custom Luau syntax highlighting (extending Lua)
const luauSyntax = () => {
  // Extend Lua grammar for Luau
  if (Prism.languages.lua) {
    // Add Luau-specific keywords
    Prism.languages.lua.keyword =
      /\b(?:and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while|continue|export|type|typeof|task\.spawn|task\.wait|task\.delay)\b/

    // Add Luau type annotations
    Prism.languages.lua["class-name"] = {
      pattern: /(\b(?:type)\s+)(\w+)/,
      lookbehind: true,
    }

    // Add type annotation syntax
    Prism.languages.lua.operator = /[=+\-*/%^#<>]=?|[~:]/

    // Add Luau specific comments
    Prism.languages.lua.comment = [
      {
        pattern: /^--\[\[[\s\S]*?\]\]/m,
        greedy: true,
      },
      {
        pattern: /--\[\[[\s\S]*?\]\]/,
        greedy: true,
      },
      {
        pattern: /--.*$/m,
        greedy: true,
      },
    ]

    // Add string patterns
    Prism.languages.lua.string = {
      pattern: /(["'])(?:(?!\1)[^\\\r\n]|\\z(?:\r\n|\s)|\\(?:\r\n|[^z]))*\1|\[(=*)\[[\s\S]*?\]\2\]/,
      greedy: true,
    }
  }
}

// Initialize Luau syntax
luauSyntax()

interface Tab {
  id: string
  name: string
  content: string
  saved: boolean
  path?: string // Optional path for opened files
}

interface Suggestion {
  label: string
  value: string
  description?: string
  type: "keyword" | "function" | "property" | "variable" | "method"
}

const LUAU_SUGGESTIONS: Suggestion[] = [
  // Keywords
  { label: "and", value: "and", type: "keyword" },
  { label: "break", value: "break", type: "keyword" },
  { label: "continue", value: "continue", type: "keyword" },
  { label: "do", value: "do", type: "keyword" },
  { label: "else", value: "else", type: "keyword" },
  { label: "elseif", value: "elseif", type: "keyword" },
  { label: "end", value: "end", type: "keyword" },
  { label: "export", value: "export", type: "keyword" },
  { label: "false", value: "false", type: "keyword" },
  { label: "for", value: "for", type: "keyword" },
  { label: "function", value: "function", type: "keyword" },
  { label: "if", value: "if", type: "keyword" },
  { label: "in", value: "in", type: "keyword" },
  { label: "local", value: "local", type: "keyword" },
  { label: "nil", value: "nil", type: "keyword" },
  { label: "not", value: "not", type: "keyword" },
  { label: "or", value: "or", type: "keyword" },
  { label: "repeat", value: "repeat", type: "keyword" },
  { label: "return", value: "return", type: "keyword" },
  { label: "then", value: "then", type: "keyword" },
  { label: "true", value: "true", type: "keyword" },
  { label: "type", value: "type", type: "keyword" },
  { label: "typeof", value: "typeof", type: "keyword" },
  { label: "until", value: "until", type: "keyword" },
  { label: "while", value: "while", type: "keyword" },

  // Common functions
  { label: "print", value: "print", description: "Prints values to the output", type: "function" },
  { label: "warn", value: "warn", description: "Prints a warning message", type: "function" },
  { label: "error", value: "error", description: "Raises an error with the given message", type: "function" },
  { label: "assert", value: "assert", description: "Raises an error if condition is false", type: "function" },
  { label: "tonumber", value: "tonumber", description: "Converts a value to a number", type: "function" },
  { label: "tostring", value: "tostring", description: "Converts a value to a string", type: "function" },
  { label: "type", value: "type", description: "Returns the type of a value", type: "function" },
  { label: "typeof", value: "typeof", description: "Returns the exact type of a value", type: "function" },
  { label: "pairs", value: "pairs", description: "Iterates over a table", type: "function" },
  { label: "ipairs", value: "ipairs", description: "Iterates over an array part of a table", type: "function" },
  { label: "next", value: "next", description: "Returns the next key-value pair in a table", type: "function" },
  { label: "unpack", value: "unpack", description: "Unpacks a table into individual values", type: "function" },
  {
    label: "rawget",
    value: "rawget",
    description: "Gets a value from a table without invoking metamethods",
    type: "function",
  },
  {
    label: "rawset",
    value: "rawset",
    description: "Sets a value in a table without invoking metamethods",
    type: "function",
  },
  {
    label: "rawequal",
    value: "rawequal",
    description: "Compares two values without invoking metamethods",
    type: "function",
  },
  { label: "collectgarbage", value: "collectgarbage", description: "Controls the garbage collector", type: "function" },

  // Roblox specific
  {
    label: "task.wait",
    value: "task.wait",
    description: "Yields the current thread for the specified duration",
    type: "function",
  },
  { label: "task.spawn", value: "task.spawn", description: "Runs a function in a separate thread", type: "function" },
  {
    label: "task.delay",
    value: "task.delay",
    description: "Schedules a function to be called after a delay",
    type: "function",
  },
  {
    label: "Instance.new",
    value: "Instance.new",
    description: "Creates a new instance of the specified class",
    type: "function",
  },
  { label: "game", value: "game", description: "The game service", type: "variable" },
  { label: "workspace", value: "workspace", description: "The workspace service", type: "variable" },
  { label: "script", value: "script", description: "The current script instance", type: "variable" },
]

export default function CodeEditor() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab-1",
      name: "New Script",
      content: "",
      saved: true,
    },
  ])
  const [activeTabId, setActiveTabId] = useState<string>("tab-1")
  const [lineCount, setLineCount] = useState<number>(1)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [currentWord, setCurrentWord] = useState<string>("")
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0)
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [cursorPosition, setCursorPosition] = useState<number>(0)

  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const [isInjecting, setIsInjecting] = useState<boolean>(false)
  const [executionResponse, setExecutionResponse] = useState<string | null>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Get the active tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0]

  // Update line count when content changes
  useEffect(() => {
    if (activeTab) {
      const lines = (activeTab.content.match(/\n/g) || []).length + 1
      setLineCount(lines)
    }
  }, [activeTab])

  // Create a new tab
  const createNewTab = () => {
    const newTabId = `tab-${Date.now()}`
    const newTab = {
      id: newTabId,
      name: `Script ${tabs.length + 1}`,
      content: "",
      saved: true,
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTabId)
  }

  // Close a tab
  const closeTab = (tabId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }

    const tab = tabs.find((t) => t.id === tabId)

    // Check if the tab has unsaved changes
    if (tab && !tab.saved) {
      if (!confirm(`The file "${tab.name}" has unsaved changes. Do you want to close it anyway?`)) {
        return
      }
    }

    if (tabs.length === 1) {
      // Don't close the last tab, just clear it
      setTabs([{ id: "tab-1", name: "New Script", content: "", saved: true }])
      setActiveTabId("tab-1")
      return
    }

    const newTabs = tabs.filter((tab) => tab.id !== tabId)
    setTabs(newTabs)

    // If we're closing the active tab, switch to another tab
    if (tabId === activeTabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id)
    }
  }

  // Handle file open button click
  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const newTabId = `tab-${Date.now()}`
      const newTab = {
        id: newTabId,
        name: file.name,
        content,
        saved: true,
        path: file.name,
      }

      setTabs([...tabs, newTab])
      setActiveTabId(newTabId)

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error reading file:", error)
      alert("Error reading file. Please try again.")
    }
  }

  // Handle save file
  const handleSaveFile = () => {
    if (!activeTab) return

    // Create a blob with the content
    const blob = new Blob([activeTab.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = activeTab.path || `${activeTab.name.endsWith(".lua") ? activeTab.name : activeTab.name + ".lua"}`
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Mark the tab as saved
    setTabs(tabs.map((tab) => (tab.id === activeTabId ? { ...tab, saved: true } : tab)))
  }

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!activeTab) return

    try {
      await navigator.clipboard.writeText(activeTab.content)

      // Show success indicator
      setCopySuccess(true)

      // Hide success indicator after 2 seconds
      setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy text: ", error)
      alert("Failed to copy to clipboard. Please try again.")
    }
  }

  // Update the inject function to use the new endpoint
  const inject = async () => {
    try {
      setIsInjecting(true)
      setExecutionError(null)
      setExecutionResponse(null)

      // Set a timeout for the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        fetch("https://v0-github-code-edit-request.vercel.app/endpoint", {  // Removed trailing slash
    method: "POST",
    headers: {
        "Content-Type": "application/json"  // Ensure correct content type
    },
    body: JSON.stringify({ data: "inject" }) // Send an object if the API expects JSON
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // Or response.text() depending on the response type
})
.then(data => {
    console.log("Returned:", data);
})
.catch(error => {
    console.error("ERM! ", error);
});

        clearTimeout(timeoutId)
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          throw new Error("Request timed out. The server might be unavailable.")
        }
        throw fetchError
      }
    } catch (error) {
      console.error("Injection error:", error)

      // Provide more specific error messages based on the error type
      let errorMessage = "Injection failed: "

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage += "Unable to connect to the server. Please check your network connection or try again later."
      } else if (error instanceof Error) {
        errorMessage += error.message
      } else {
        errorMessage += String(error)
      }

      setExecutionError(errorMessage)
    } finally {
      setIsInjecting(false)
      clearTimeout(timeoutId)
    }
  }

  // Handle delete tab
  const handleDeleteTab = () => {
    if (!activeTab) return

    // Ask for confirmation
    if (!confirm(`Are you sure you want to close the "${activeTab.name}" tab?`)) {
      return
    }

    // Close the active tab
    closeTab(activeTabId)
  }

  // Update the handleExecute function to use the new endpoint
  const handleExecute = async () => {
    if (!activeTab) return

    const code = activeTab.content
    if (!code.trim()) {
      setExecutionError("Cannot execute empty code")
      return
    }

    try {
      setIsExecuting(true)
      setExecutionError(null)
      setExecutionResponse(null)

      // Set a timeout for the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        fetch("https://v0-github-code-edit-request.vercel.app/endpoint", {  // Removed trailing slash
    method: "POST",
    headers: {
        "Content-Type": "application/json"  // Ensure correct content type
    },
    body: JSON.stringify({ data: code }) // Send an object if the API expects JSON
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // Or response.text() depending on the response type
})
.then(data => {
    console.log("Returned:", data);
})
.catch(error => {
    console.error("ERM! ", error);
});

        clearTimeout(timeoutId)
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          throw new Error("Request timed out. The server might be unavailable.")
        }
        throw fetchError
      }
    } catch (error) {
      console.error("Execution error:", error)

      // Provide more specific error messages based on the error type
      let errorMessage = "Execution failed: "

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage += "Unable to connect to the server. Please check your network connection or try again later."
      } else if (error instanceof Error) {
        errorMessage += error.message
      } else {
        errorMessage += String(error)
      }

      setExecutionError(errorMessage)
    } finally {
      setIsExecuting(false)
    }
  }

  // Highlight Luau code
  const highlightLuau = (code: string) => {
    return Prism.highlight(code, Prism.languages.lua, "lua")
  }

  // Synchronize scrolling between editor and line numbers
  useEffect(() => {
    const editorElement = editorRef.current
    const lineNumbersElement = lineNumbersRef.current

    if (!editorElement || !lineNumbersElement) return

    const handleScroll = () => {
      lineNumbersElement.scrollTop = editorElement.scrollTop
    }

    editorElement.addEventListener("scroll", handleScroll)
    return () => {
      editorElement.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Get the current word at cursor position
  const getCurrentWord = useCallback((text: string, position: number): string => {
    // Find the start of the current word
    let start = position
    while (start > 0 && /[\w.]/.test(text.charAt(start - 1))) {
      start--
    }

    // Find the end of the current word
    let end = position
    while (end < text.length && /[\w.]/.test(text.charAt(end))) {
      end++
    }

    return text.substring(start, end)
  }, [])

  // Find the textarea element in the editor
  const findTextarea = useCallback(() => {
    if (!editorContainerRef.current) return null
    return editorContainerRef.current.querySelector("textarea")
  }, [])

  // Calculate cursor position in pixels
  const calculateCursorPosition = useCallback((text: string, cursorPos: number) => {
    // Create a temporary element to measure text
    const temp = document.createElement("div")
    temp.style.position = "absolute"
    temp.style.visibility = "hidden"
    temp.style.whiteSpace = "pre"
    temp.style.fontFamily = '"Fira code", "Fira Mono", monospace'
    temp.style.fontSize = "14px"

    // Find the line and column of the cursor
    const textBeforeCursor = text.substring(0, cursorPos)
    const lines = textBeforeCursor.split("\n")
    const lineIndex = lines.length - 1
    const columnIndex = lines[lineIndex].length

    // Get the text of the current line up to the cursor
    const currentLineText = lines[lineIndex]

    // Measure the width of the text up to the cursor
    temp.textContent = currentLineText.substring(0, columnIndex)
    document.body.appendChild(temp)
    const width = temp.getBoundingClientRect().width
    document.body.removeChild(temp)

    // Calculate the position
    const lineHeight = 24 // Approximate line height in pixels
    return {
      top: (lineIndex + 1) * lineHeight + 8, // +8 for padding
      left: width + 8, // +8 for padding
    }
  }, [])

  // Update tab content and handle autocomplete
  const updateTabContent = useCallback(
    (content: string) => {
      // Update the tab content
      setTabs(tabs.map((tab) => (tab.id === activeTabId ? { ...tab, content, saved: false } : tab)))

      // Find the textarea and get cursor position
      const textarea = findTextarea()
      if (!textarea) return

      const cursorPos = textarea.selectionStart
      setCursorPosition(cursorPos)

      // Get the current word being typed
      const word = getCurrentWord(content, cursorPos)
      setCurrentWord(word)

      // Filter suggestions based on the current word
      if (word.length >= 1) {
        const filtered = LUAU_SUGGESTIONS.filter((suggestion) =>
          suggestion.label.toLowerCase().startsWith(word.toLowerCase()),
        ).slice(0, 10) // Limit to 10 suggestions

        setFilteredSuggestions(filtered)
        setSelectedSuggestionIndex(0)

        // Show suggestions if we have matches
        const shouldShowSuggestions = filtered.length > 0
        setShowSuggestions(shouldShowSuggestions)

        if (shouldShowSuggestions) {
          // Calculate position for the suggestions dropdown
          const position = calculateCursorPosition(content, cursorPos)
          setSuggestionPosition(position)
        }
      } else {
        setShowSuggestions(false)
      }
    },
    [activeTabId, calculateCursorPosition, findTextarea, getCurrentWord, tabs],
  )

  // Handle keyboard events for autocomplete navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || filteredSuggestions.length === 0) return

      // Navigate through suggestions with arrow keys
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === "Tab" || e.key === "Enter") {
        // Apply the selected suggestion
        e.preventDefault()
        applySuggestion(filteredSuggestions[selectedSuggestionIndex])
      } else if (e.key === "Escape") {
        // Close suggestions
        e.preventDefault()
        setShowSuggestions(false)
      }
    },
    [filteredSuggestions, showSuggestions],
  )

  // Apply the selected suggestion
  const applySuggestion = useCallback(
    (suggestion: Suggestion) => {
      if (!activeTab) return

      // Find the start of the current word
      let start = cursorPosition
      const text = activeTab.content

      while (start > 0 && /[\w.]/.test(text.charAt(start - 1))) {
        start--
      }

      // Replace the current word with the suggestion
      const beforeWord = text.substring(0, start)
      const afterWord = text.substring(cursorPosition)
      const newContent = beforeWord + suggestion.value + afterWord

      // Update the content
      setTabs(tabs.map((tab) => (tab.id === activeTabId ? { ...tab, content: newContent, saved: false } : tab)))

      // Close the suggestions
      setShowSuggestions(false)

      // Set focus back to the editor
      setTimeout(() => {
        const textarea = findTextarea()
        if (textarea) {
          textarea.focus()
          const newCursorPos = start + suggestion.value.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    },
    [activeTab, activeTabId, cursorPosition, findTextarea, tabs],
  )

  // Set up event listeners for the editor
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showSuggestions) {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "Tab" ||
          e.key === "Enter" ||
          e.key === "Escape"
        ) {
          e.preventDefault()
        }
      }
    }

    // Add global event listener to prevent default behavior
    window.addEventListener("keydown", handleGlobalKeyDown, true)

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true)
    }
  }, [showSuggestions])

  // Find the textarea when the component mounts
  useEffect(() => {
    // Wait for the editor to be fully rendered
    const timeoutId = setTimeout(() => {
      const textarea = findTextarea()
      if (textarea) {
        // Add input event listener to detect cursor position changes
        textarea.addEventListener("click", () => {
          if (showSuggestions) {
            setShowSuggestions(false)
          }
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [findTextarea, showSuggestions])

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col mx-auto w-full max-w-5xl my-16 rounded-lg overflow-hidden border border-gray-800 bg-[#121212]">
        {/* Tab bar */}
        <div className="flex items-center px-2 py-2 bg-[#1e1e1e] border-b border-gray-800 overflow-x-auto">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "flex items-center px-3 py-1.5 rounded-md text-sm cursor-pointer",
                  tab.id === activeTabId
                    ? "bg-[#252525] text-gray-300"
                    : "bg-[#1e1e1e] text-gray-500 hover:text-gray-300",
                )}
              >
                <File className="h-4 w-4 mr-2" />
                <span>
                  {tab.name}
                  {!tab.saved && " *"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-2 text-gray-500 hover:text-gray-300"
                  onClick={(e) => closeTab(tab.id, e)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-300"
              onClick={createNewTab}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">New Tab</span>
            </Button>
          </div>
          <div className="ml-auto flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-300"
              onClick={handleOpenClick}
            >
              <FolderOpen className="h-4 w-4" />
              <span className="sr-only">Open</span>
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".lua,.txt" className="hidden" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-300"
              onClick={handleSaveFile}
            >
              <Save className="h-4 w-4" />
              <span className="sr-only">Save</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-300 relative"
              onClick={handleCopyToClipboard}
            >
              {copySuccess ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-300"
              onClick={handleDeleteTab}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete Tab</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-300"
              onClick={inject}
              disabled={isInjecting}
            >
              {isInjecting ? (
                <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              <span className="sr-only">Inject</span>
            </Button>
            <Button
              variant="ghost"
              className="ml-2 bg-[#252525] hover:bg-[#303030] text-gray-300 rounded-md px-3 py-1.5 flex items-center"
              onClick={handleExecute}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Execute
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Line numbers */}
          <div
            ref={lineNumbersRef}
            className="bg-[#1a1a1a] text-gray-500 text-right p-2 select-none w-12 font-mono text-sm overflow-hidden"
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="h-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code editor with syntax highlighting */}
          <div className="flex-1 overflow-auto bg-[#1a1a1a] custom-scrollbar relative" ref={editorRef}>
            <div ref={editorContainerRef} className="relative">
              <Editor
                value={activeTab.content}
                onValueChange={updateTabContent}
                highlight={highlightLuau}
                padding={8}
                onKeyDown={handleKeyDown}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                  backgroundColor: "#1a1a1a",
                  color: "#D4D4D4",
                  minHeight: "100%",
                }}
                textareaClassName="outline-none"
                className="editor-wrapper"
                id="luau-editor"
              />

              {/* Autocomplete dropdown */}
              {showSuggestions && (
                <div
                  className="absolute z-50 bg-[#252525] border border-[#3e3e3e] rounded-md shadow-lg overflow-hidden text-white"
                  style={{
                    top: `${suggestionPosition.top}px`,
                    left: `${suggestionPosition.left}px`,
                    maxHeight: "200px",
                    overflowY: "auto",
                    width: "250px",
                  }}
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.label}
                      className={cn(
                        "px-2 py-1 cursor-pointer flex items-start hover:bg-[#3e3e3e]",
                        index === selectedSuggestionIndex ? "bg-[#3e3e3e]" : "",
                      )}
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex items-center">
                          <span className="font-medium text-sm text-white">{suggestion.label}</span>
                          <span
                            className={cn(
                              "ml-2 text-xs px-1 rounded",
                              suggestion.type === "keyword"
                                ? "bg-blue-900 text-blue-300"
                                : suggestion.type === "function"
                                  ? "bg-purple-900 text-purple-300"
                                  : suggestion.type === "property"
                                    ? "bg-green-900 text-green-300"
                                    : suggestion.type === "variable"
                                      ? "bg-yellow-900 text-yellow-300"
                                      : "bg-gray-900 text-gray-300",
                            )}
                          >
                            {suggestion.type}
                          </span>
                        </div>
                        {suggestion.description && (
                          <span className="text-xs text-gray-200">{suggestion.description}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {(executionResponse || executionError) && (
          <div className="mt-4 p-4 rounded-md border text-sm font-mono overflow-auto max-h-32">
            {executionResponse && <div className="text-green-400">{executionResponse}</div>}
            {executionError && <div className="text-red-400">{executionError}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

