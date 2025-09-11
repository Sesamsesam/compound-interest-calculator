"use client"

import { Container, Typography, Button, Box, Paper } from "@mui/material"
import { ParticleTextEffect } from "@/components/ParticleTextEffect"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Fixed rainbow WebGL background behind all content */}
      {/* Some Tailwind setups ignore negative z utilities.
         Use an inline style with zIndex -1 to guarantee the
         shader stays behind every other element. */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
      >
        <WebGLShader />
      </div>
      {/* Hero Section with Particle Effect - Full Width */}
      <section className="w-full overflow-hidden p-0 m-0 relative">
        {/* Logo overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Image 
            src="/CPH_Trading_Academy_Logo-B2-removebg-preview.png" 
            alt="Copenhagen Trading Academy Logo" 
            width={200} 
            height={100} 
            // removed 200 % scaling – now rendered at normal size
          />
        </div>
        <ParticleTextEffect words={["Byg Formue", "Renters Rente", "Det 8. Vidunder"]} />
        {/* Hero CTA Button (overlay at bottom-center of hero) */}
        {/* Adjusted positioning for equal spacing above and below */}
        <Box
          className="absolute left-1/2 -translate-x-1/2 z-10"
          style={{ bottom: '80px' }} // 20 px higher than previous (was ~64 px)
        >
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/calculator"
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
            }}
          >
            Beregn Økonomisk Frihed
          </Button>
        </Box>
        {/* Scroll indicator arrow */}
        <Box
          className="absolute left-1/2 -translate-x-1/2 text-white/70 select-none"
          style={{ bottom: '30px' }} // increased gap: 50 → 30 (now 50 px below the button)
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
        </Box>
      </section>

      {/* Einstein Quote Section - Moved to be first after hero */}
      <section>
        <Container maxWidth="md">
          <Paper 
            elevation={24}
            className="p-8 sm:p-12 backdrop-blur-md rounded-xl mb-12"
            sx={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Box className="flex flex-col md:flex-row items-center gap-6">
              <Box className="flex-shrink-0 md:w-1/3">
                <Image
                  src="/Albert-Einstein-PNG-Image-HD.png"
                  alt="Albert Einstein"
                  width={300}
                  height={400}
                  className="rounded-lg"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Box className="flex flex-col items-center text-center md:items-start md:text-left">
                <FormatQuoteIcon 
                  sx={{ 
                    fontSize: 60, 
                    color: 'primary.main',
                    opacity: 0.8,
                    mb: 2
                  }} 
                />
                <Typography 
                  variant="h4" 
                  component="blockquote"
                  className="mb-6 text-white italic"
                  sx={{ 
                    fontWeight: 600,
                    lineHeight: 1.4,
                    letterSpacing: '-0.01em'
                  }}
                >
                  &quot;Renters rente er verdens ottende vidunder. Den, der forstår det, tjener på det... den, der ikke gør, betaler for det.&quot;
                </Typography>
                <Typography 
                  variant="h6" 
                  component="cite"
                  className="text-slate-300"
                  sx={{ fontWeight: 500 }}
                >
                  — Albert Einstein
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </section>

      {/* 7% and Tid er Din Ven Cards - Moved to be second after hero */}
      <section>
        <Container maxWidth="md">
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <Paper 
              className="p-6 backdrop-blur-sm rounded-xl"
              sx={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <Box className="flex flex-col items-center text-center">
                <TrendingUpIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: 'warning.main',
                    mb: 2
                  }} 
                />
                <Typography variant="h6" className="mb-2 text-white font-bold">
                  20% Årligt Afkast
                </Typography>
                <Typography className="text-slate-300">
                  5.000 kr/md over 20 år bliver til <strong className="text-yellow-400">13.441.535 kr</strong>
                </Typography>
              </Box>
            </Paper>
            
            <Paper 
              className="p-6 backdrop-blur-sm rounded-xl"
              sx={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <Box className="flex flex-col items-center text-center">
                <AccessTimeIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: 'success.main',
                    mb: 2
                  }} 
                />
                <Typography variant="h6" className="mb-2 text-white font-bold">
                  Tid er Din Ven
                </Typography>
                <Typography className="text-slate-300">
                  Jo tidligere du starter, desto mere dramatisk bliver væksten af din investering.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
      </section>

      {/* Hero Content Section - Moved to be third after hero */}
      <section>
        <Container maxWidth="md">
          <Paper 
            elevation={24}
            className="p-8 sm:p-12 backdrop-blur-md rounded-xl mb-12"
            sx={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Typography 
              variant="h6" 
              className="text-slate-300 mx-auto text-center"
              sx={{ fontWeight: 400 }}
            >
              Oplev hvordan små, regelmæssige investeringer kan vokse til betydelige formuer over tid med renters rente effekten.
            </Typography>
          </Paper>
        </Container>
      </section>

      {/* Story Section - Restructured to Single Column */}
      <section>
        <Container maxWidth="md">
          {/* Styrken ved Renters Rente Card */}
          <Paper 
            elevation={24}
            className="p-8 sm:p-12 backdrop-blur-md rounded-xl mb-12"
            sx={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              className="mb-6 text-white text-center"
              sx={{
                fontWeight: 700,
                mb: 4,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: 0,
                  width: '100%',
                  height: 4,
                  backgroundColor: 'primary.main',
                  borderRadius: 2,
                },
              }}
            >
              Styrken ved Renters Rente
            </Typography>
            <Box className="flex flex-col md:flex-row items-center gap-6">
              <Image
                src="/einstein funny.png"
                alt="Funny Albert Einstein"
                width={220}
                height={300}
                className="rounded-lg"
                style={{ objectFit: 'contain' }}
              />
              <Box>
                <Typography paragraph className="text-slate-300 mb-4">
                  Renters rente er det finansielle fænomen, hvor du ikke kun tjener renter på din oprindelige investering, men også på de renter, du allerede har optjent.
                </Typography>

                <Typography paragraph className="text-slate-300 mb-4">
                  Over tid kan denne effekt føre til eksponentiel vækst af din formue. Jo længere din investeringshorisont er, desto mere dramatisk bliver effekten.
                </Typography>
              </Box>
            </Box>
            
            {/* The following two paragraphs have been moved to their own card below */}
          </Paper>

          {/* Additional Insight Card (moved text) */}
          <Paper 
            elevation={24}
            className="p-8 sm:p-12 backdrop-blur-md rounded-xl mb-12"
            sx={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Typography paragraph className="text-slate-300 mb-4">
              Selv små månedlige bidrag kan vokse til betydelige summer over årtier, især når de investeres med konsistente afkast.
            </Typography>
            <Typography paragraph className="text-slate-300">
              Vores beregner giver dig mulighed for at visualisere denne vækst og forstå, hvordan forskellige afkastrater og investeringsperioder kan påvirke din økonomiske fremtid.
            </Typography>
          </Paper>
        </Container>
      </section>

      {/* CTA Section */}
      <section>
        <Container maxWidth="md">
          <Box
            className="p-8 sm:p-12 rounded-2xl text-center mb-12"
            sx={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              className="mb-6 text-white"
              sx={{ fontWeight: 700 }}
            >
              Start Din Rejse Mod Økonomisk Frihed
            </Typography>
            
            <Typography 
              variant="h6" 
              className="mb-8 text-slate-300 max-w-2xl mx-auto"
              sx={{ fontWeight: 400 }}
            >
              Udnyt kraften ved renters rente og se, hvordan dine investeringer kan vokse over tid. Prøv vores beregner nu og tag det første skridt mod en sikrere økonomisk fremtid.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/calculator"
              className="px-8 py-3 text-lg"
              sx={{
                mt: 4,
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
              }}
            >
              Beregn Økonomisk Frihed
            </Button>
          </Box>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-4 mt-12">
        <Container maxWidth="md">
          <Box className="flex justify-center">
            <Image
              src="/CPH_Trading_Academy_Logo-B2-removebg-preview.png"
              alt="Copenhagen Trading Academy Logo"
              width={160}
              height={80}
            />
          </Box>
        </Container>
      </footer>
    </div>
  );
}
