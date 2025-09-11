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
import { AnimatedCounter } from "@/components/AnimatedCounter"
import { scrollToNextSection } from "@/utils/smoothScroll"
import { GlowingEffect } from "@/components/ui/glowing-effect"

export default function Home() {
  const handleScrollDown = () => {
    scrollToNextSection({ duration: 800, easing: 'easeOutCubic', offset: -20 });
  };

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
      {/*  h-[70vh] on mobile keeps hero compact, lg:min-h-screen gives full viewport on desktop  */}
      <section className="w-full overflow-hidden p-0 m-0 relative h-[70vh] lg:min-h-screen">
        <ParticleTextEffect words={["Byg Formue", "Renters Rente", "Det 8. Vidunder"]} />
        {/* Hero CTA Button (overlay at bottom-center of hero) */}
        {/* Adjusted positioning for equal spacing above and below */}
        <Box
          className="absolute left-1/2 -translate-x-1/2 z-10"
          /* Position the CTA higher: ~25 % of hero height from the bottom.
             Keeps good spacing on desktop while remaining sensible on mobile. */
          style={{ bottom: '25%' }}
        >
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/calculator"
            className="text-sm sm:text-base"
            sx={{
              py: { xs: 1, sm: 1.5 },
              px: { xs: 3, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
              minHeight: "44px", // Minimum touch target size
              /* Prevent multi-line wrapping on narrow screens */
              whiteSpace: "nowrap",
            }}
          >
            Beregn Økonomisk Frihed
          </Button>
        </Box>
        {/* Scroll indicator arrow */}
        <Box
          className="absolute left-1/2 -translate-x-1/2 text-white/70 select-none cursor-pointer"
          style={{ bottom: '20px' }} // Adjusted for mobile
          onClick={handleScrollDown}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
        </Box>
      </section>

      {/* Einstein Quote Section - Moved to be first after hero */}
      {/*  Push further below fold on desktop (lg:mt-32) but keep normal spacing on mobile (mt-8) */}
      <section className="mt-8 lg:mt-32">
        <Container maxWidth="md">
          <Box sx={{ position: 'relative', borderRadius: 2 }}>
            <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
            <Paper 
              elevation={24}
              className="pt-6 sm:pt-8 md:pt-12 px-4 sm:px-8 md:px-12 pb-4 backdrop-blur-md rounded-xl mb-8 sm:mb-12"
              sx={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <Box className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <Box className="flex-shrink-0 md:w-1/3">
                  <Image
                    src="/Albert-Einstein-PNG-Image-HD.png"
                    alt="Albert Einstein"
                    width={300}
                    height={400}
                    className="rounded-lg w-[200px] sm:w-[300px]"
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
                <Box className="flex flex-col items-center text-center md:items-start md:text-left">
                  <FormatQuoteIcon 
                    sx={{ 
                      fontSize: { xs: 40, sm: 50, md: 60 }, 
                      color: 'primary.main',
                      opacity: 0.8,
                      mb: { xs: 1, sm: 2 }
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="blockquote"
                    className="mb-4 sm:mb-6 text-white italic"
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                      fontWeight: 600,
                      lineHeight: 1.4,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    &quot;Renters rente er verdens ottende vidunder. Den, der forstår det, tjener på det... den, der ikke gør, betaler for det.&quot;
                  </Typography>
                  <Typography 
                    variant="body1" 
                    component="cite"
                    className="text-white"
                    sx={{ 
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                      fontWeight: 500 
                    }}
                  >
                    — Albert Einstein
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </section>

      {/* 7% and Tid er Din Ven Cards - Moved to be second after hero */}
      <section>
        <Container maxWidth="md">
          {/* items-stretch forces children to same height */}
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 items-stretch">
            <Box sx={{ position: 'relative', borderRadius: 2 }}>
              <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
              <Paper 
                /* h-full makes this card stretch to full row height */
                className="p-4 sm:p-6 backdrop-blur-sm rounded-xl h-full"
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <Box className="flex flex-col items-center text-center">
                  <TrendingUpIcon 
                    sx={{ 
                      fontSize: { xs: 36, sm: 48 }, 
                      color: 'warning.main',
                      mb: { xs: 1, sm: 2 }
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    className="mb-2 text-white font-bold"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    20% Årligt Afkast
                  </Typography>
                  <Typography 
                    className="text-white"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    5.000 kr/md over 20 år bliver til{" "}
                    <strong className="font-extrabold text-lg sm:text-xl md:text-2xl">
                      <AnimatedCounter
                        value={13441535}
                        prefix=""
                        suffix=" kr"
                        gradientText={true}
                        duration={1500}
                        delay={300}
                        useEasing={true}
                        formatter={(value) => value.toLocaleString('da-DK')}
                      />
                    </strong>
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ position: 'relative', borderRadius: 2 }}>
              <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
              <Paper 
                /* h-full makes this card stretch to full row height */
                className="p-4 sm:p-6 backdrop-blur-sm rounded-xl h-full"
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <Box className="flex flex-col items-center text-center">
                  <AccessTimeIcon 
                    sx={{ 
                      fontSize: { xs: 36, sm: 48 }, 
                      color: 'success.main',
                      mb: { xs: 1, sm: 2 }
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    className="mb-2 text-white font-bold"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Tid er Din Ven
                  </Typography>
                  <Typography 
                    className="text-white"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    Jo tidligere du starter, desto mere dramatisk bliver væksten af din investering.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </section>

      {/* Hero Content Section - Moved to be third after hero */}
      <section>
        <Container maxWidth="md">
          <Box sx={{ position: 'relative', borderRadius: 2 }}>
            <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
            <Paper 
              elevation={24}
              className="p-6 sm:p-8 md:p-12 backdrop-blur-md rounded-xl mb-8 sm:mb-12"
              sx={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <Typography 
                variant="body1" 
                className="text-white mx-auto text-center"
                sx={{ 
                  fontWeight: 400,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                }}
              >
                Oplev hvordan små, regelmæssige investeringer kan vokse til betydelige formuer over tid med renters rente effekten.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </section>

      {/* Story Section - Restructured to Single Column */}
      <section>
        <Container maxWidth="md">
          {/* Styrken ved Renters Rente Card */}
          <Box sx={{ position: 'relative', borderRadius: 2 }}>
            <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
            <Paper 
              elevation={24}
              className="p-6 sm:p-8 md:p-12 rounded-xl mb-8 sm:mb-12"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 215, 0, 0.8)', // thin golden border
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                className="mb-6 text-black text-center"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                  fontWeight: 700,
                  mb: 2,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'max-content',
                    height: 4,
                    backgroundColor: 'primary.main',
                    borderRadius: 2,
                  },
                }}
              >
                Styrken ved Renters Rente
              </Typography>
              <Box className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <Image
                  src="/rentes rente transparent.png"
                  alt="Renters Rente Graf"
                  width={280}
                  height={380}
                  className="rounded-lg w-[200px] sm:w-[280px]"
                  style={{ objectFit: 'contain' }}
                />
                <Box>
                  <Typography 
                    paragraph 
                    className="text-gray-800 mb-3 sm:mb-4"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    Renters rente er det finansielle fænomen, hvor du ikke kun tjener renter på din oprindelige investering, men også på de renter, du allerede har optjent.
                  </Typography>

                  <Typography 
                    paragraph 
                    className="text-gray-800 mb-3 sm:mb-4"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    Over tid kan denne effekt føre til eksponentiel vækst af din formue. Jo længere din investeringshorisont er, desto mere dramatisk bliver effekten.
                  </Typography>
                </Box>
              </Box>
              
              {/* The following two paragraphs have been moved to their own card below */}
            </Paper>
          </Box>

          {/* Additional Insight Card (moved text) */}
          <Box sx={{ position: 'relative', borderRadius: 2 }}>
            <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
            <Paper 
              elevation={24}
              className="pt-6 sm:pt-8 md:pt-12 px-6 sm:px-8 md:px-12 pb-4 sm:pb-6 backdrop-blur-md rounded-xl mb-8 sm:mb-12"
              sx={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <Typography 
                paragraph 
                className="text-white mb-3 sm:mb-4"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Selv små månedlige bidrag kan vokse til betydelige summer over årtier, især når de investeres med konsistente afkast.
              </Typography>
              <Typography 
                paragraph 
                className="text-white"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Vores beregner giver dig mulighed for at visualisere denne vækst og forstå, hvordan forskellige afkastrater og investeringsperioder kan påvirke din økonomiske fremtid.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </section>

      {/* CTA Section */}
      <section>
        <Container maxWidth="md">
          <Box sx={{ position: 'relative', borderRadius: 2 }}>
            <GlowingEffect disabled={false} proximity={100} spread={50} blur={0} borderWidth={2} glow={true} />
            <Box
              className="p-6 sm:p-8 md:p-12 rounded-2xl text-center mb-8 sm:mb-12"
              sx={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <Box sx={{ marginBottom: { xs: '24px', sm: '32px' } }}>
                <Typography
                  variant="h5"
                  component="h2"
                  className="text-white"
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  Start Din Rejse Mod Økonomisk Frihed
                </Typography>
              </Box>
              
              <Typography 
                variant="body1" 
                className="mb-6 sm:mb-8 text-white mx-auto text-center"
                sx={{ 
                  fontWeight: 400,
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                }}
              >
                Udnyt kraften ved renters rente og se, hvordan dine investeringer kan vokse over tid. Prøv vores beregner nu og tag det første skridt mod en sikrere økonomisk fremtid.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/calculator"
                className="text-sm sm:text-base"
                sx={{
                  mt: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 3, sm: 4 },
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
                  minHeight: "44px", // Minimum touch target size
                  /* Prevent multi-line wrapping on narrow screens */
                  whiteSpace: "nowrap",
                }}
              >
                Beregn Økonomisk Frihed
              </Button>
            </Box>
          </Box>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-3 sm:py-4 mt-8 sm:mt-12">
        <Container maxWidth="md">
          <Box className="flex justify-center">
            <Image
              src="/CPH_Trading_Academy_Logo-B2-removebg-preview.png"
              alt="Copenhagen Trading Academy Logo"
              width={120}
              height={60}
              className="w-[120px] sm:w-[160px]"
            />
          </Box>
        </Container>
      </footer>
    </div>
  );
}
