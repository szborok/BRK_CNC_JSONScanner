1 BEGIN PGM W5270NS01060A18 MM
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
15 ; T915167027 | FRA-P8221-S5.7R0_H63W6L65 / DM=5.7 CR=0 TL=101
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
36 * - TOOL: T915167027 | FRA-P8221-S5.7R0_H63W6L65 / DM=5.7 CR=0 TL=101
37 TOOL CALL "SN05700000360144" Z S6701 DL+0 DR+0
38 ; ----------------------------------
39 *   - JOB: 21: D9_cycl208_01
40 ; ----------------------------------
41 CALL LBL 1 ; RESET WORKING PLANE
42 FN 0:Q2=911 ; XY FEED RATE
43 FN 0:Q3=911 ; Z FEED RATE
44 CYCL DEF 32.0 TOLERANCE
45 CYCL DEF 32.1 T0.015
46 CYCL DEF 32.2 HSC-MODE:0
47 ; --- SAFEPOSITION -----------------
48 L Z0 R0 FMAX M91
49 L X0 R0 FMAX M91
50 L Y-425 R0 FMAX M91
51 ; ----------------------------------
52 ; ----------------------------------
53 ; A0 C0
54 ; ----------------------------------
55 CYCL DEF 7.0 DATUM SHIFT
56 CYCL DEF 7.1 X0
57 CYCL DEF 7.2 Y0
58 CYCL DEF 7.3 Z0
59 PLANE SPATIAL SPA0 SPB0 SPC0 STAY SEQ+ TABLE ROT
60 L A+Q120 C+Q122 R0 FMAX M126
61 L X160.5 Y-35 R0 F MAX M3
62 M7
63 L Z25 R0 F MAX
64 CYCL DEF 208 BORE MILLING~
  Q200=1 ;SET-UP CLEARANCE~
  Q201=-23 ;DEPTH~
  Q206=Q2 ;FEED RATE FOR PLUNGING~
  Q334=1 ;PLUNGING DEPTH~
  Q203=0 ;SURFACE COORDINATE~
  Q204=25 ;2ND SET-UP CLEARANCE~
  Q335=9 ;NOMINAL DIAMETER~
  Q342=8.9 ;ROUGHING DIAMETER~
  Q351=1 ;CLIMB OR UP-CUT
65 L X160.5 Y-35 R0 F MAX M99
66 CYCL DEF 32.0 TOLERANCE
67 CYCL DEF 32.1
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
104 END PGM W5270NS01060A18 MM
