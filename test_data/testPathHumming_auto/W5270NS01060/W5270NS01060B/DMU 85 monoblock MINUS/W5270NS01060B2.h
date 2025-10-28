1 BEGIN PGM W5270NS01060B2 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMU 85 monoBLOCK
7 ; DATE   	  : 22.10.2025
8 ; TIME  	  : 13:50
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ;created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ---------------
15 ; T1673146209 | TGT-TCD-FEJSULLY15_H63W20L80X / DM=15 CR=0 TL=174
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
36 * - TOOL: T1673146209 | TGT-TCD-FEJSULLY15_H63W20L80X / DM=15 CR=0 TL=174
37 TOOL CALL "FS15000000940319" Z S1698 DL+0 DR+0
38 ; ----------------------------------
39 *   - JOB: 2: D15
40 ; ----------------------------------
41 CALL LBL 1 ; RESET WORKING PLANE
42 FN 0:Q3=221 ; Z FEED RATE
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
57 L X-0.5 Y17 R0 F MAX M3
58 M7
59 L Z56 R0 F MAX
60 CYCL DEF 200 DRILLING~
  Q200=3 ;SET-UP CLEARANCE~
  Q201=-10.8 ;DEPTH~
  Q206=Q3 ;FEED RATE FOR PLUNGING~
  Q202=10.8 ;PLUNGING DEPTH~
  Q210=0 ;DWELL TIME AT TOP~
  Q203=0 ;SURFACE COORDINATE~
  Q204=56 ;2ND SET-UP CLEARANCE~
  Q211=0 ;DWELL TIME AT BOTTOM
61 L X-0.5 Y17 R0 F MAX M99
62 L X-80.5 Y17 R0 F MAX M99
63 L X-160.5 Y45 R0 F MAX M99
64 L X-160.5 Y-35 R0 F MAX M99
65 L X79.5 Y17 R0 F MAX M99
66 L X173.5 Y35 R0 F MAX M99
67 L X173.5 Y-35 R0 F MAX M99
68 M9
69 M5
70 CALL LBL 1 ; RESET WORKING PLANE
71 ; --- SAFEPOSITION END -------------
72 L Z0 R0 FMAX M91
73 L X0 R0 FMAX M91
74 L Y-425 R0 FMAX M91
75 ; ----------------------------------
76 ; --- SAFEPOSITION END -------------
77 L Z0 R0 FMAX M91
78 L X0 R0 FMAX M91
79 L Y0 R0 FMAX M91
80 ; ----------------------------------
/81 M30
82 * --- LBL BEGIN --------------------
83 LBL 1 ; RESET WORKING PLANE
84 CYCL DEF 7.0 DATUM SHIFT
85 CYCL DEF 7.1 X0
86 CYCL DEF 7.2 Y0
87 CYCL DEF 7.3 Z0
88 PLANE RESET STAY
89 LBL 0
90 ; ----------------------------------
91 LBL "CuttingEdgesCheck"
92 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
93 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
94 LBL 0
95 ; ----------------------------------
96 LBL "CuttingEdges1"
97 FN 0: Q1901=4
98 LBL 0
99 ; ----------------------------------
100 LBL "CuttingEdges2"
101 FN 0: Q1901=3
102 LBL 0
103 ; ----------------------------------
104 END PGM W5270NS01060B2 MM
