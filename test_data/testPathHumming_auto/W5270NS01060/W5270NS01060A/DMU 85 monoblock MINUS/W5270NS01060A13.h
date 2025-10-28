1 BEGIN PGM W5270NS01060A13 MM
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
15 ; T21780198 | GUH-5512-BHF5_H63Z6L80 / DM=5 CR=0 TL=136
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
36 * - TOOL: T21780198 | GUH-5512-BHF5_H63Z6L80 / DM=5 CR=0 TL=136
37 TOOL CALL "BH05000000560172" Z S5093 DL+0 DR+0
38 ; ----------------------------------
39 *   - JOB: 16: D5
40 ; ----------------------------------
41 CALL LBL 1 ; RESET WORKING PLANE
42 FN 0:Q3=407 ; Z FEED RATE
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
57 L X-107.5 Y14 R0 F MAX M3
58 M7
59 L Z57 R0 F MAX
60 CYCL DEF 200 DRILLING~
  Q200=1 ;SET-UP CLEARANCE~
  Q201=-27.773 ;DEPTH~
  Q206=Q3 ;FEED RATE FOR PLUNGING~
  Q202=27.773 ;PLUNGING DEPTH~
  Q210=0 ;DWELL TIME AT TOP~
  Q203=-0.0004 ;SURFACE COORDINATE~
  Q204=57.0004 ;2ND SET-UP CLEARANCE~
  Q211=0 ;DWELL TIME AT BOTTOM
61 L X-107.5 Y14 R0 F MAX M99
62 L X-27.5 Y14 R0 F MAX M99
63 L X52.5 Y14 R0 F MAX M99
64 L X132.5 Y14 R0 F MAX M99
65 M9
66 M5
67 CALL LBL 1 ; RESET WORKING PLANE
68 ; --- SAFEPOSITION END -------------
69 L Z0 R0 FMAX M91
70 L X0 R0 FMAX M91
71 L Y-425 R0 FMAX M91
72 ; ----------------------------------
73 ; --- SAFEPOSITION END -------------
74 L Z0 R0 FMAX M91
75 L X0 R0 FMAX M91
76 L Y0 R0 FMAX M91
77 ; ----------------------------------
/78 M30
79 * --- LBL BEGIN --------------------
80 LBL 1 ; RESET WORKING PLANE
81 CYCL DEF 7.0 DATUM SHIFT
82 CYCL DEF 7.1 X0
83 CYCL DEF 7.2 Y0
84 CYCL DEF 7.3 Z0
85 PLANE RESET STAY
86 LBL 0
87 ; ----------------------------------
88 LBL "CuttingEdgesCheck"
89 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
90 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
91 LBL 0
92 ; ----------------------------------
93 LBL "CuttingEdges1"
94 FN 0: Q1901=4
95 LBL 0
96 ; ----------------------------------
97 LBL "CuttingEdges2"
98 FN 0: Q1901=3
99 LBL 0
100 ; ----------------------------------
101 END PGM W5270NS01060A13 MM
