---
appearance:
  table_of_contents: default
category:
  uri: Docs
content:
  excerpt: >-
    **CWR-JSON** is a JSON encoding of the [Common Works Registration
    (CWR)](https://www.cisac.org/formats) format — the global standard for
    registering musical works between publishers and collecting societies (PROs
    / MROs).  It preserves the full semantics of CWR EDI while replacing
    fixed-width ASCII records with a structured, human-readable JSON document.
    The result is a format that can be validated with JSON Schema, consumed
    directly by REST APIs, and read without a CWR parser.
position: 0
privacy:
  view: public
slug: overview
title: CWR-JSON Specification
---
Please click at the bottom right to follow-through to the Introduction or jump directly to the Work metadata, Interested Parties or Sound recording sections below.

<Cards>
  <Card title="Work Metadata" href="/docs/work-metadata" icon="fa-duotone fa-rocket-launch">
    Work Object
  </Card>

  <Card title="Interested Parties" href="/docs/interested-parties" icon="fa-duotone fa-solid fa-users">
    Parties Object mapping in CWR-JSON
  </Card>

  <Card title="Sound Recordings" href="/docs/sound-recordings" icon="fa-duotone fa-light fa-music">
    Sound Recordings mapping
  </Card>
</Cards>

<HTMLBlock>{`
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 16px 20px; margin: 20px 0; font-family: inherit;">

  <!-- Header with Icon and Title -->
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-size: 20px; line-height: 1;">📣</span>
    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #0f172a; border: none; padding: 0;">Sign Up</h3>
  </div>

  <!-- Content Container (Float wrapper) -->
  <div style="color: #334155; font-size: 15px; line-height: 1.6;">
    
    <!-- Floated Right Image -->
    <img 
      src="https://files.readme.io/29240446e48edd0752070fec4dd1bc609b22775898a23316cf6ba963faf4ca17-cwr-json-wde.png" 
      alt="Sign up illustration" 
      style="float: right; width: 200px; max-width: 40%; margin-left: 16px; margin-bottom: 12px; border-radius: 6px; object-fit: contain;" 
    />

    <p style="margin: 0 0 12px 0;">

      You are with a Music Publisher and want to finally solve OP-SP work data sharing? You are with a PRO/CMO and want to get high-quality work registrations and ISWC-ISRC links? You are a DSP and want to get the same ISWC-ISRC links on top of your Asset IDs?
    </p>

    <p style="margin: 0 0 16px 0;">

      Then sign-up here for a free Implementation Support service and Newsletter provided courtesy of ALV.
    </p>

    <!-- Clearfix to ensure container wraps floats correctly -->
    <div style="clear: both;"></div>

    <!-- Call to Action Link / Button -->
    <a 
      href="https://forms.gle/SQL7s4YSBNHPVFUC8" 
      target="_blank" 
      rel="noopener noreferrer"
      style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;"
    >
      Click here to sign-up for free
    </a>

  </div>
</div>
`}</HTMLBlock>