import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import { Temporal } from 'temporal-polyfill'
import Paper from '@mui/material/Paper';

import Image from './livein19202.png';
//import { SequenceAnimator } from 'react-sequence-animator';



const iplayerPink = '#f54996';

const urls = {
  test: 'https://jfayiszondlcqngo5vavioz6bq0ibxen.lambda-url.eu-west-1.on.aws/',
  live: 'https://ypdjc6zbc5cnvth24lk3mm45sm0qtgps.lambda-url.eu-west-1.on.aws'
};

function titlefor(o, rel) {
  return o.title_hierarchy?.titles?.find((t) => t.inherited_from?.link?.rel === `pips-meta:${rel}`)?.title?.$;
}

function gettitles(item) {
  const b = titlefor(item, 'brand');
  const s = titlefor(item, 'series');
  const e = item.title_hierarchy?.titles?.find((t) => !t.inherited_from)?.title?.$;
  const t = b ? `${b} ` : '';
  if (s) {
    return {
      episodeTitle: `${e}`,
      brandSeriesTitle: `${s}: ${t}`,
    };
  }
  return {
    episodeTitle: `${e}`,
    brandSeriesTitle: `${t}`,
  };
}

function chooseNext(next, minDuration) {
  const ok = (next || []).filter((e) => {
    if (e?.duration && e?.title) {
      return Temporal.Duration.compare(minDuration, Temporal.Duration.from(e.duration)) < 0;
    }
    return false;
  });
  if (ok.length > 0) {
    return ok[0];
  }
  return { title: '' };
}

function NowNext({ now, next, previewMinutes, steady, styling }) {

  let r;
  let text;
  let brandseriestext;
  let eventtitle;
  let eventtime;

  if (next) {
    const start = Date.parse(next.start);
    const minutesToNext = Math.round((start - (new Date())) / 1000 / 60);
    console.log('minutes to next start', minutesToNext);
    if (minutesToNext <= 0) {
      r = '';
    }
    if (minutesToNext < previewMinutes) {
      const to = gettitles(next)
      r = `next up: ${to.episodeTitle}`;
      brandseriestext = to.brandSeriesTitle;
      eventtitle = 'ON NEXT';
      eventtime = `| Starting in ${minutesToNext} mins`;
    }
  }
  if (r) {
    text = r;
  } else {
    if (now) {
      const end = Temporal.Instant.from(now.start).add(Temporal.Duration.from(now.duration));
      console.log(`start ${now.start} end ${end}`);
      const durationleft = Math.round(Temporal.Duration.from(Temporal.Now.instant().until(end)).seconds / 60);
      console.log(`Minutes left of Now playing? ${durationleft}`);
      // const durationleft = Math.round((end - (new Date())) / 1000 / 60);
      const to = gettitles(now)
      text = ` ${to.episodeTitle}`;
      brandseriestext = to.brandSeriesTitle;
      eventtitle = 'ON NOW';
      eventtime = `| ${durationleft} mins left `;
    } else {
      text = '';
    }
  }
  return (
    <Box sx={{
      width: 'auto', height: '160px',
      display: 'grid', gridTemplateRows: '1fr 6fr 1fr', paddingLeft: '5%', paddingbottom: '5%'
    }}>
      <Box >
        <Typography

          fontSize={'2rem'} ce>
          <span
            style={{
              color: iplayerPink
            }}>
            <b>{eventtitle}</b>
          </span>
          &nbsp;&nbsp;&nbsp;{eventtime}</Typography>

      </Box>
      <Box>
        <Fade in={true} timeout={500}>
          <Typography fontSize={'4.5rem'} ce><b>{text}</b></Typography>
        </Fade>
      </Box>
{styling === 'adult'? 
      <Box>
        <Fade in={true} timeout={500}>
          <Typography fontSize={'2.5rem'} ce>{brandseriestext}</Typography>
        </Fade>
      </Box>
:
''
}

    </Box>
  );
}

function Bottom({ params }) {

  const minDuration = Temporal.Duration.from(params.minDuration || 'PT2M');
  const previewMinutes = parseInt(params.next || '2', 2);
  const env = params.env || 'live';
  const sid = params.sid || 'History_Channel';
  const region = params.region || 'eu-west-2';
  const styling = params.styling || 'childrens';

  const [on, setOn] = useState(false);
  const [now, setNow] = useState();
  const [next, setNext] = useState();
  const [steady, setSteady] = useState(false);
  const containerRef = React.useRef(null);

  const FALSE = false;
  console.log(steady);

  // 5 second timer
  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      (async () => {
        const sOfm = (new Date()).getSeconds();
        if ((sOfm / 2) < 12) {
          setOn(true);
        } else {
          setOn(FALSE);
        }
        const r = await fetch(`${urls[env]}/${sid}/${region}`);
        if (r.ok) {
          const data = await r.json()
          setNext(chooseNext(data.next, minDuration));
          setNow(data.now);
        }
      })();
    }, 5000);
    return () => clearInterval(interval);
  });
  /*        <Box>{steady ? <Fade in={true} timeout={1000}>
              <Typography fontSize={'4rem'} color={iplayerPink} marginLeft={5} marginTop={3}>iPLAYER</Typography>
            </Fade>
            : <SequenceAnimator duration={3000} onSequenceEnd={() => setSteady(true)}>
              {introImages.map((im, index) => (<img key={index} src={im} alt='BBC' />))}
            </SequenceAnimator>
          }
          </Box
  */
console.log(`styling log ${styling}`);
  return (
    <Box sx={{ overflow: 'hidden' }} ref={containerRef}>
      <Slide direction="up"
        in={on} mountOnEnter unmountOnExit
        container={containerRef.current}
        onEntered={() => console.log('entered')}
        addEndListener={() => setSteady(FALSE)}>
        <Box sx={styling === 'adult' ?
          {

            height: 180, width: 'auto', color: 'white',
            background: 'linear-gradient(to right, rgba(15, 15, 15, .7), rgba(245, 73, 151, .7))',
            display: 'grid', gridTemplateColumns: '1fr', marginbottom: '100px'
          }
          : {

            height: 180, width: 'auto', color: 'black',
            background: 'linear-gradient(to right, rgba(255, 255, 255, .7), rgba(255, 255, 255, .7))',
            display: 'grid', gridTemplateColumns: '1fr', marginbottom: '100px'
          }}>

          <Box display='flex' alignItems='center'>
            <NowNext now={now} next={next} previewMinutes={previewMinutes} styling={styling}/>
          </Box>
        </Box>
      </Slide>
    </Box>
  );
}

function TopLeft({ show }) {
  if (show) {
    return '';//<img src={logo} alt='CBeebies' />;
  }
  return '';
}

function TopRight({ show }) {
  if (show) {
    return <img alt='bounce' src='https://upload.wikimedia.org/wikipedia/commons/1/14/Animated_PNG_example_bouncing_beach_ball.png' />;
  }
  return '';
}
export default function App(params) {

  return (

      <Box sx={{
        width: 'auto', height: '100vh',
        display: 'grid', gridTemplateRows: '2fr 11fr max-content 1fr'
      }}>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          <Box><TopLeft show={params.tl} /></Box>
          <Box></Box>
          <Box sx={{ display: 'block', marginLeft: 'auto' }}><TopRight show={params.tr} /></Box>
        </Box>
        <Box></Box>
        <Bottom params={params} />
        <Box>
      </Box>
      </Box>


  );
}