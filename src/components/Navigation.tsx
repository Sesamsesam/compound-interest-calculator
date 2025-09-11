"use client"

import { useState, useEffect } from "react"
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Box, 
  Container,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import CalculateIcon from "@mui/icons-material/Calculate"
import HomeIcon from "@mui/icons-material/Home"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Navigation = () => {
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll effect for AppBar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  const navItems = [
    { name: "Home", path: "/", icon: <HomeIcon fontSize="small" /> },
    { name: "Calculator", path: "/calculator", icon: <CalculateIcon fontSize="small" /> }
  ]

  return (
    <AppBar 
      position="sticky" 
      /* Keep elevation constant to avoid white flash during scroll */
      elevation={0}
      suppressHydrationWarning
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        /* Keep blur always on and static to avoid flashing */
        backdropFilter: "blur(8px)",
        transition: "background-color 0.3s ease",
        /* Always show subtle bottom border – no transition to prevent flicker */
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            position: "relative"
          }}
        >
          {/* Company Name - Left Side - Hidden on mobile */}
          <Typography
            variant="subtitle2"
            sx={{
              display: { xs: "block", md: "block" },
              color: "rgba(255, 255, 255, 0.8)",
              fontWeight: 500,
              letterSpacing: "0.05em",
              fontSize: "0.75rem",
              position: "absolute",
              left: { xs: "50%", md: 0 },
              transform: { xs: "translateX(-50%)", md: "none" },
              textAlign: { xs: "center", md: "left" },
              textTransform: "uppercase"
            }}
          >
            CPH TRADING ACADEMY
          </Typography>

          {/* Desktop Navigation - Centered */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: { xs: "none", md: "flex" },
              justifyContent: "center" 
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.name}
                component={Link}
                href={item.path}
                startIcon={item.icon}
                sx={{
                  mx: 2,
                  color: "white",
                  position: "relative",
                  "&::after": pathname === item.path ? {
                    content: '""',
                    position: "absolute",
                    width: "100%",
                    height: "3px",
                    bottom: 0,
                    left: 0,
                    backgroundColor: "#3b82f6",
                    borderRadius: "3px 3px 0 0",
                  } : {},
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* Mobile Navigation */}
          {isMobile && (
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }
                }}
              >
                {navItems.map((item) => (
                  <MenuItem 
                    key={item.name} 
                    onClick={handleClose}
                    component={Link}
                    href={item.path}
                    selected={pathname === item.path}
                    sx={{
                      color: "white",
                      "&.Mui-selected": {
                        backgroundColor: "rgba(59, 130, 246, 0.15)",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {item.icon}
                      <Typography sx={{ ml: 1 }}>{item.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navigation