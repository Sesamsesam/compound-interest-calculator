"use client"

import { useContext } from "react"
import { IconButton, Tooltip, useTheme } from "@mui/material"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import { ThemeContext } from "./ThemeProvider"

export default function ThemeToggle() {
  const { mode, toggleMode } = useContext(ThemeContext)
  const theme = useTheme()
  
  return (
    <Tooltip title={mode === "dark" ? "Skift til lys tilstand" : "Skift til mørk tilstand"}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        aria-label="toggle theme"
        sx={{
          p: 1,
          borderRadius: "50%",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: theme.palette.mode === "dark" 
              ? "rgba(255, 255, 255, 0.1)" 
              : "rgba(0, 0, 0, 0.05)",
            transform: "rotate(12deg)",
          },
        }}
      >
        {mode === "dark" ? (
          <LightModeIcon 
            sx={{ 
              color: "rgba(255, 215, 0, 0.9)",
              filter: "drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))",
            }} 
          />
        ) : (
          <DarkModeIcon 
            sx={{ 
              color: "#334155",
            }} 
          />
        )}
      </IconButton>
    </Tooltip>
  )
}
