1 BEGIN PGM W5270NS01060A5 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMU 85 monoBLOCK
7 ; DATE   	  : 20.10.2025
8 ; TIME  	  : 13:00
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ;created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ---------------
15 ; T794097663 | D10_HSS_CSF_H63T-D3-D16 / DM=10 CR=0 TL=211.2
16 ; ---- TOOLLIST END ----------------
17 ;
18 ; --- BLOCK FORM -------------------
19 BLK FORM 0.1 Z X-187 Y-55.5 Z-50.6
20 BLK FORM 0.2 X187 Y55.5 Z0.6
21 ; ----------------------------------
22 ;
23 ; ----------------------------------
24 CYCL DEF 392 ATC~
   Q240=0 ;TUNING MODE~
   Q241=1 ;WEIGHT MODE
25 ; ----------------------------------
26 M127 ; SHORTER PATH TRAVERSE OF ROTARY AXES OFF
27 FUNCTION RESET TCPM
28 CALL LBL 1 ; RESET WORKING PLANE
29 ; --- SAFEPOSITION TOOL CALL -------
30 L Z0 R0 FMAX M91
31 L X0 R0 FMAX M91
32 L Y-425 R0 FMAX M91
33 ; ----------------------------------
34 L A0 R0 FMAX
35 ; ----------------------------------
36 * - TOOL: T794097663 | D10_HSS_CSF_H63T-D3-D16 / DM=10 CR=0 TL=211.2
37 TOOL CALL "HS10000001020246" Z S637 DL+0 DR+0
38 TOOL DEF 0
39 ; ----------------------------------
40 *   - JOB: 10: D10
41 ; ----------------------------------
42 CALL LBL 1 ; RESET WORKING PLANE
43 FN 0:Q3=95 ; Z FEED RATE
44 ; --- SAFEPOSITION -----------------
45 L Z0 R0 FMAX M91
46 L X0 R0 FMAX M91
47 L Y-425 R0 FMAX M91
48 ; ----------------------------------
49 ; ----------------------------------
50 ; A-90 C270
51 ; ----------------------------------
52 CYCL DEF 7.0 DATUM SHIFT
53 CYCL DEF 7.1 X186.5
54 CYCL DEF 7.2 Y0
55 CYCL DEF 7.3 Z-25
56 PLANE SPATIAL SPA90 SPB0 SPC90 STAY SEQ- TABLE ROT
57 L A+Q120 C+Q122 R0 FMAX M126
58 L X-39 Y7 R0 F MAX M3
59 M8
60 L Z70 R0 F MAX
61 CYCL DEF 203 UNIVERSAL DRILLING~
  Q200=3 ;SET-UP CLEARANCE~
  Q201=-33.3385 ;DEPTH~
  Q206=Q3 ;FEED RATE FOR PLUNGING~
  Q202=1 ;PLUNGING DEPTH~
  Q210=0 ;DWELL TIME AT TOP~
  Q203=0 ;SURFACE COORDINATE~
  Q204=70 ;2ND SET-UP CLEARANCE~
  Q212=0 ;DECREMENT~
  Q213=2 ;BREAKS~
  Q205=1 ;MIN. PLUNGING DEPTH~
  Q211=0 ;DWELL TIME AT BOTTOM~
  Q208=25000 ;RETRACTION FEED RATE~
  Q256=0.2 ;DIST FOR CHIP BRKNG
62 L X-39 Y7 R0 F MAX M99
63 M9
64 M5
65 CALL LBL 1 ; RESET WORKING PLANE
66 ; --- SAFEPOSITION END -------------
67 L Z0 R0 FMAX M91
68 L X0 R0 FMAX M91
69 L Y-425 R0 FMAX M91
70 ; ----------------------------------
71 L A0 C0 R0 FMAX ; STRAIGTHEN ROTATIONAXES R1 R2
72 ; --- SAFEPOSITION END -------------
73 L Z0 R0 FMAX M91
74 L X0 R0 FMAX M91
75 L Y0 R0 FMAX M91
76 ; ----------------------------------
/77 M30
78 * --- LBL BEGIN --------------------
79 LBL 1 ; RESET WORKING PLANE
80 CYCL DEF 7.0 DATUM SHIFT
81 CYCL DEF 7.1 X0
82 CYCL DEF 7.2 Y0
83 CYCL DEF 7.3 Z0
84 PLANE RESET STAY
85 LBL 0
86 ; ----------------------------------
87 LBL "CuttingEdgesCheck"
88 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
89 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
90 LBL 0
91 ; ----------------------------------
92 LBL "CuttingEdges1"
93 FN 0: Q1901=4
94 LBL 0
95 ; ----------------------------------
96 LBL "CuttingEdges2"
97 FN 0: Q1901=3
98 LBL 0
99 ; ----------------------------------
100 END PGM W5270NS01060A5 MM
