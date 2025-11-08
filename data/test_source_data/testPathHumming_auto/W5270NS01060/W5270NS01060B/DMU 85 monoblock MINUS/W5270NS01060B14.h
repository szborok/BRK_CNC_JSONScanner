1 BEGIN PGM W5270NS01060B14 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMU 85 monoBLOCK
7 ; DATE   	  : 22.10.2025
8 ; TIME  	  : 13:51
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ;created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ---------------
15 ; T2077745050 | GUH-5512-BHF9_H63Z10L85 / DM=9 CR=0 TL=178
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
36 * - TOOL: T2077745050 | GUH-5512-BHF9_H63Z10L85 / DM=9 CR=0 TL=178
37 TOOL CALL "BH09000000930154" Z S2829 DL+0 DR+0
38 ; ----------------------------------
39 *   - JOB: 18: D9
40 ; ----------------------------------
41 CALL LBL 1 ; RESET WORKING PLANE
42 FN 0:Q3=354 ; Z FEED RATE
43 ; --- SAFEPOSITION -----------------
44 L Z0 R0 FMAX M91
45 L X0 R0 FMAX M91
46 L Y-425 R0 FMAX M91
47 ; ----------------------------------
48 ; ----------------------------------
49 ; A0 C0
50 ; ----------------------------------
51 CYCL DEF 7.0 DATUM SHIFT
52 CYCL DEF 7.1 X0
53 CYCL DEF 7.2 Y0
54 CYCL DEF 7.3 Z0
55 PLANE SPATIAL SPA0 SPB0 SPC0 STAY SEQ+ TABLE ROT
56 L A+Q120 C+Q122 R0 FMAX M126
57 L X-160.5 Y-35 R0 F MAX M3
58 M7
59 L Z56 R0 F MAX
60 CYCL DEF 200 DRILLING~
  Q200=3 ;SET-UP CLEARANCE~
  Q201=-19.638 ;DEPTH~
  Q206=Q3 ;FEED RATE FOR PLUNGING~
  Q202=19.638 ;PLUNGING DEPTH~
  Q210=0 ;DWELL TIME AT TOP~
  Q203=-10.8 ;SURFACE COORDINATE~
  Q204=66.8 ;2ND SET-UP CLEARANCE~
  Q211=0 ;DWELL TIME AT BOTTOM
61 L X-160.5 Y-35 R0 F MAX M99
62 M9
63 M5
64 CALL LBL 1 ; RESET WORKING PLANE
65 ; --- SAFEPOSITION END -------------
66 L Z0 R0 FMAX M91
67 L X0 R0 FMAX M91
68 L Y-425 R0 FMAX M91
69 ; ----------------------------------
70 ; --- SAFEPOSITION END -------------
71 L Z0 R0 FMAX M91
72 L X0 R0 FMAX M91
73 L Y0 R0 FMAX M91
74 ; ----------------------------------
/75 M30
76 * --- LBL BEGIN --------------------
77 LBL 1 ; RESET WORKING PLANE
78 CYCL DEF 7.0 DATUM SHIFT
79 CYCL DEF 7.1 X0
80 CYCL DEF 7.2 Y0
81 CYCL DEF 7.3 Z0
82 PLANE RESET STAY
83 LBL 0
84 ; ----------------------------------
85 LBL "CuttingEdgesCheck"
86 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
87 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
88 LBL 0
89 ; ----------------------------------
90 LBL "CuttingEdges1"
91 FN 0: Q1901=4
92 LBL 0
93 ; ----------------------------------
94 LBL "CuttingEdges2"
95 FN 0: Q1901=3
96 LBL 0
97 ; ----------------------------------
98 END PGM W5270NS01060B14 MM
