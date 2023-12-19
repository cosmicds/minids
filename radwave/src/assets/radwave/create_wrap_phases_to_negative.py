import os, glob

import numpy as np

import pandas as pd

from datetime import date, timedelta

filename_template = "RW_cluster_oscillation_{}_updated_radec.csv"

# get phase 0
phase0_file = filename_template.format(0)

# read in the file
df = pd.read_csv(phase0_file, sep=',')
start_time = df['start_times'][0]
end_time = df['end_times'][0]


def subtract_one_day(n,time):
    """
    given a string date in the format 2023-10-17T11:55:55Z
    subtract one day and return the new string date
    """
    fmt = '%Y-%m-%dT%H:%M:%SZ'
    dt = pd.to_datetime(time)
    dt = dt - timedelta(days=n)
    return dt.strftime(fmt)

def end_time_for_negative_phase(negphase):
    # use phase 0 to get the start time
    # subtract phase number of days from the start time
    # return the date in the format 2023-10-17T11:55:55Z
    fmt = '%Y-%m-%dT%H:%M:%SZ'
    dt0 = pd.to_datetime(start_time) + timedelta(days=negphase+1)
    return dt0.strftime(fmt)


# create files with negative phases
# so phase 0 = 360, -1 = 359, -2 = 358, etc.

for negphase in range(-15, 0):
    # create the filename
    filename = filename_template.format(360 + negphase)
    # read in the file
    df = pd.read_csv(filename, sep=',')
    
    # subtract one day from the start time and end time
    df['end_times'] = end_time_for_negative_phase(negphase)
    df['start_times'] = df['end_times'].apply(lambda x: subtract_one_day(1, x))
    
    # write out the file
    outfile = filename_template.format(negphase)
    
    print('writing {} to {}'.format(360 + negphase, negphase))
    
    df.to_csv(outfile, sep=',', index=False)
    
    
