"""Start with the houses; preserve an explicitly linked or restored trip."""
def apply_default(code):
    marker='/* BP DEFAULT HOUSES 20261120 */'
    if marker in code:return code
    old="let mode=activeHouse?'houses':'dates',validationAttempted=false;"
    assert code.count(old)==1
    code=code.replace(old,marker+"\n let mode='houses',validationAttempted=false;")
    old='guests:returning.guests,arrival:returning.arrival,departure:returning.departure});globalMonth=returning.month;}'
    assert code.count(old)==1
    return code.replace(old,'guests:returning.guests,arrival:returning.arrival,departure:returning.departure});globalMonth=returning.month;if(!activeHouse)mode=\'dates\';}')
