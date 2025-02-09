import arsJersey from '../assets/ARS_KIT.webp';
import avaJersey from '../assets/AVA_KIT.webp';
import bouJersey from '../assets/BOU_KIT.webp';
import breJersey from '../assets/BRE_KIT.webp';
import brhJersey from '../assets/BRH_KIT.webp';
import cheJersey from '../assets/CHE_KIT.webp';
import cryJersey from '../assets/CRY_KIT.webp';
import eveJersey from '../assets/EVE_KIT.webp';
import fulJersey from '../assets/FUL_KIT.webp';
import ipsJersey from '../assets/IPS_KIT.webp';
import leiJersey from '../assets/LEI_KIT.webp';
import livJersey from '../assets/LIV_KIT.webp';
import mciJersey from '../assets/MCI_KIT.webp';
import munJersey from '../assets/MUN_KIT.webp';
import newJersey from '../assets/NEW_KIT.webp';
import ntgJersey from '../assets/NTG_KIT.webp';
import souJersey from '../assets/SOU_KIT.webp';
import totJersey from '../assets/TOT_KIT.webp';
import whuJersey from '../assets/WHU_KIT.webp';
import wlvJersey from '../assets/WLV_KIT.webp';

import arsGlkJersey from '../assets/ARS_GLK_KIT.webp';
import avaGlkJersey from '../assets/AVA_GLK_KIT.webp';
import bouGlkJersey from '../assets/BOU_GLK_KIT.webp';
import breGlkJersey from '../assets/BRE_GLK_KIT.webp';
import brhGlkJersey from '../assets/BRH_GLK_KIT.webp';
import cheGlkJersey from '../assets/CHE_GLK_KIT.webp';
import cryGlkJersey from '../assets/CRY_GLK_KIT.webp';
import eveGlkJersey from '../assets/EVE_GLK_KIT.webp';
import fulGlkJersey from '../assets/FUL_GLK_KIT.webp';
import ipsGlkJersey from '../assets/IPS_GLK_KIT.webp';
import leiGlkJersey from '../assets/LEI_GLK_KIT.webp';
import livGlkJersey from '../assets/LIV_GLK_KIT.webp';
import mciGlkJersey from '../assets/MCI_GLK_KIT.webp';
import munGlkJersey from '../assets/MUN_GLK_KIT.webp';
import newGlkJersey from '../assets/NEW_GLK_KIT.webp';
import ntgGlkJersey from '../assets/NTG_GLK_KIT.webp';
import souGlkJersey from '../assets/SOU_GLK_KIT.webp';
import totGlkJersey from '../assets/TOT_GLK_KIT.webp';
import whuGlkJersey from '../assets/WHU_GLK_KIT.webp';
import wlvGlkJersey from '../assets/WLV_GLK_KIT.webp';


export const jerseyImages: Record<string, string> = {
  ARS: arsJersey,
  AVA: avaJersey,
  BOU: bouJersey,
  BRE: breJersey,
  BRH: brhJersey,
  CHE: cheJersey,
  CRY: cryJersey,
  EVE: eveJersey,
  FUL: fulJersey,
  IPS: ipsJersey,
  LEI: leiJersey,
  LIV: livJersey,
  MCI: mciJersey,
  MUN: munJersey,
  NEW: newJersey,
  NTG: ntgJersey,
  SOU: souJersey,
  TOT: totJersey,
  WHU: whuJersey,
  WLV: wlvJersey,
};

export const glkJerseyImages: Record<string, string> = {
    ARS: arsGlkJersey,
    AVA: avaGlkJersey,
    BOU: bouGlkJersey,
    BRE: breGlkJersey,
    BRH: brhGlkJersey,
    CHE: cheGlkJersey,
    CRY: cryGlkJersey,
    EVE: eveGlkJersey,
    FUL: fulGlkJersey,
    IPS: ipsGlkJersey,
    LEI: leiGlkJersey,
    LIV: livGlkJersey,
    MCI: mciGlkJersey,
    MUN: munGlkJersey,
    NEW: newGlkJersey,
    NTG: ntgGlkJersey,
    SOU: souGlkJersey,
    TOT: totGlkJersey,
    WHU: whuGlkJersey,
    WLV: wlvGlkJersey,
};

export const convertStatName = (statName: string) => {
    return statName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}